import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/clarity/AppShell";
import { Capture } from "@/components/clarity/Capture";
import { ItemList } from "@/components/clarity/ItemList";
import { TYPE_META, TYPE_ORDER } from "@/components/clarity/itemMeta";
import { sortItems, useStore, type ItemType } from "@/lib/store";

export const Route = createFileRoute("/all")({
  head: () => ({
    meta: [
      { title: "Clarity — All" },
      { name: "description", content: "Every item across Clarity." },
    ],
  }),
  component: AllPage,
});

type Filter = "all" | ItemType;
type Status = "active" | "done" | "all";

function AllPage() {
  const items = useStore((s) => s.items);
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState<Status>("active");

  const filtered = items.filter((i) => {
    if (filter !== "all" && i.type !== filter) return false;
    if (status === "active" && i.completedAt) return false;
    if (status === "done" && !i.completedAt) return false;
    return true;
  });

  const counts: Record<string, number> = { all: items.filter((i) => !i.completedAt).length };
  for (const k of TYPE_ORDER) counts[k] = items.filter((i) => i.type === k && !i.completedAt).length;

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-1">All items</h1>
      <p className="text-sm text-muted-foreground mb-5">{items.length} total · {counts.all} active</p>

      <div className="mb-5"><Capture scheduleToday={false} /></div>

      {/* Type filter pills */}
      <div className="-mx-4 px-4 overflow-x-auto mb-3">
        <div className="flex gap-2 min-w-max pb-1">
          <Pill active={filter === "all"} onClick={() => setFilter("all")} label={`All · ${counts.all}`} />
          {TYPE_ORDER.map((k) => {
            const m = TYPE_META[k];
            const Icon = m.icon;
            return (
              <Pill key={k} active={filter === k} onClick={() => setFilter(k)}
                label={`${m.label} · ${counts[k]}`} icon={<Icon className="size-3.5" />} tint={m.tint} />
            );
          })}
        </div>
      </div>

      {/* Status segmented */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-secondary mb-4">
        {(["active", "done", "all"] as Status[]).map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`text-xs font-medium py-1.5 rounded-lg capitalize transition-colors ${
              status === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">Nothing matches.</p>
      ) : (
        <ItemList items={sortItems(filtered)} presorted />
      )}
    </AppShell>
  );
}

function Pill({ active, onClick, label, icon, tint }: {
  active: boolean; onClick: () => void; label: string; icon?: React.ReactNode; tint?: string;
}) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border whitespace-nowrap transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : `${tint ?? "bg-surface"} border-border text-foreground/80 hover:text-foreground`
      }`}>
      {icon}{label}
    </button>
  );
}
