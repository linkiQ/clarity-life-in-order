import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Focus, Sparkles, CircleCheck, UserCircle2 } from "lucide-react";
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
  const userId = useStore((s) => s.userId);
  const mounted = useHydrated();

  const today = items.filter(isTodayItem);
  const active = today.filter((t) => !t.completedAt);
  const completed = today.filter((t) => t.completedAt);
  const urgent = active.filter((t) => t.priority === "high").length;
  const visible = focusMode
    ? sortItems(active).filter((t) => t.priority === "high").slice(0, 3)
    : sortItems(active);

  const allDone = today.length > 0 && active.length === 0;

  return (
    <AppShell>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80" suppressHydrationWarning>
              {mounted
                ? new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
                : "Today"}
            </p>
            <h1 className="font-display text-[34px] leading-tight font-semibold tracking-tight mt-2">
              {mounted ? greet() : "Hello"}
              <span className="text-primary">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-tint-peach text-orange-700 px-3 py-1.5 text-sm font-semibold">
                <Flame className="size-4" />
                {streak}
              </div>
            )}
            {!userId && (
              <Link
                to="/auth"
                aria-label="Sign in"
                className="size-9 rounded-full bg-secondary text-secondary-foreground grid place-items-center hover:bg-secondary/70 transition"
              >
                <UserCircle2 className="size-5" />
              </Link>
            )}
          </div>
        </div>

        <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
          {today.length === 0 ? (
            <><Sparkles className="inline size-4 mr-1 text-primary" /> Nothing scheduled. Add what matters today.</>
          ) : allDone ? (
            <><CircleCheck className="inline size-4 mr-1 text-emerald-600" /> Everything's done. Beautiful.</>
          ) : (
            <>
              You have <span className="text-priority-high font-semibold">{urgent} urgent</span> and{" "}
              <span className="text-foreground font-semibold">{active.length - urgent} other</span>{" "}
              {active.length === 1 ? "thing" : "things"} today.
            </>
          )}
        </p>
      </header>

      {/* Capture */}
      <div className="mb-8">
        <Capture placeholder="What needs to happen today?" />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
          {focusMode ? "Focus · top 3" : "Today"}
        </h2>
        <button
          onClick={toggleFocusMode}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
            focusMode
              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
          }`}
        >
          <Focus className="size-3.5" /> Focus
        </button>
      </div>

      <ItemList items={visible} empty="Quiet day. Tap + or type above to add something." />

      {completed.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">
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
