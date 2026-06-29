import { createFileRoute } from "@tanstack/react-router";
import { Flame, Focus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/clarity/AppShell";
import { Capture } from "@/components/clarity/Capture";
import { ItemList } from "@/components/clarity/ItemList";
import { isTodayItem, sortItems, toggleFocusMode, useHydrated, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clarity — Today" },
      { name: "description", content: "Your clear, focused plan for today." },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const items = useStore((s) => s.items);
  const focusMode = useStore((s) => s.focusMode);
  const streak = useStore((s) => s.streak.count);
  const mounted = useHydrated();

  const today = items.filter(isTodayItem);
  const active = today.filter((t) => !t.completedAt);
  const completed = today.filter((t) => t.completedAt);
  const urgent = active.filter((t) => t.priority === "high").length;
  const visible = focusMode
    ? sortItems(active).filter((t) => t.priority === "high").slice(0, 3)
    : active;

  return (
    <AppShell>
      <header className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground" suppressHydrationWarning>
              {mounted
                ? new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
                : "Today"}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight mt-1">
              {mounted ? greet() : "Hello"}.
            </h1>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-tint-peach text-orange-700 px-3 py-1.5 text-sm font-semibold shrink-0">
              <Flame className="size-4" />
              {streak}
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {active.length === 0 ? (
            <><Sparkles className="inline size-4 mr-1 text-primary" /> You're all clear for today.</>
          ) : (
            <>You have <span className="text-priority-high font-semibold">{urgent} urgent</span> and{" "}
              <span className="text-foreground font-semibold">{active.length}</span> pending today.</>
          )}
        </p>
      </header>

      <div className="mb-5">
        <Capture placeholder="What needs to happen today?" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {focusMode ? "Focus — top 3" : "Today"}
        </h2>
        <button
          onClick={toggleFocusMode}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            focusMode ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Focus className="size-3.5" /> Focus
        </button>
      </div>

      <ItemList items={visible} empty="Quiet day. Add something above." />

      {completed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Done today · {completed.length}
          </h2>
          <ItemList items={completed} />
        </div>
      )}
    </AppShell>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
