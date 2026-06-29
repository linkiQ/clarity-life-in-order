import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/clarity/AppShell";
import { Capture } from "@/components/clarity/Capture";
import { ItemList } from "@/components/clarity/ItemList";
import { dayKey, sortItems, startOfDay, useStore, type Item } from "@/lib/store";

export const Route = createFileRoute("/upcoming")({
  head: () => ({
    meta: [
      { title: "Clarity — Upcoming" },
      { name: "description", content: "What's coming up across all your days." },
    ],
  }),
  component: UpcomingPage,
});

function UpcomingPage() {
  const items = useStore((s) => s.items);

  const future = items.filter((i) => {
    if (i.completedAt) return false;
    const when = i.dueAt ?? i.scheduledFor;
    return when && when >= startOfDay(Date.now());
  });

  // group by day
  const buckets = new Map<string, { date: number; items: Item[]; label: string }>();
  const today = startOfDay(Date.now());
  for (const i of future) {
    const when = startOfDay((i.dueAt ?? i.scheduledFor) as number);
    const key = dayKey(when);
    if (!buckets.has(key)) {
      buckets.set(key, { date: when, items: [], label: bucketLabel(when, today) });
    }
    buckets.get(key)!.items.push(i);
  }
  const sortedBuckets = [...buckets.values()].sort((a, b) => a.date - b.date);

  // No-date items
  const someday = items.filter((i) => !i.completedAt && !i.dueAt && !i.scheduledFor && i.type !== "idea" && i.type !== "note");
  const overdue = items.filter((i) => {
    if (i.completedAt) return false;
    const when = i.dueAt ?? i.scheduledFor;
    return when && when < today;
  });

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Upcoming</h1>
      <p className="text-sm text-muted-foreground mb-5">Everything on the horizon, grouped by day.</p>

      <div className="mb-6"><Capture scheduleToday={false} placeholder="Add for any day…" /></div>

      <div className="space-y-7">
        {overdue.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 text-priority-high">
              Overdue · {overdue.length}
            </h2>
            <ItemList items={sortItems(overdue)} presorted />
          </section>
        )}

        {sortedBuckets.length === 0 && overdue.length === 0 && someday.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">Nothing scheduled. Plan ahead above.</p>
        )}

        {sortedBuckets.map((b) => (
          <section key={b.date}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 text-muted-foreground">
              {b.label} · {b.items.length}
            </h2>
            <ItemList items={sortItems(b.items)} presorted />
          </section>
        ))}

        {someday.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 text-muted-foreground">
              Someday · {someday.length}
            </h2>
            <ItemList items={sortItems(someday)} presorted />
          </section>
        )}
      </div>
    </AppShell>
  );
}

function bucketLabel(ts: number, today: number) {
  const diff = Math.round((ts - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return new Date(ts).toLocaleDateString([], { weekday: "long" });
  return new Date(ts).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
