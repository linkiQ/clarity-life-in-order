import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Flame, Trash2 } from "lucide-react";
import { AppShell } from "@/components/clarity/AppShell";
import { toggleTheme, useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Clarity — Settings" },
      { name: "description", content: "Personalize Clarity." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const theme = useStore((s) => s.theme);
  const streak = useStore((s) => s.streak);
  const totalTasks = useStore((s) => s.tasks.length);
  const isDark = theme === "dark";

  function reset() {
    if (typeof window === "undefined") return;
    if (confirm("Delete all tasks and reset Clarity?")) {
      localStorage.removeItem("clarity:v1");
      window.location.reload();
    }
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <section className="rounded-2xl bg-card border border-border divide-y divide-border">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-4 py-4 gap-3 text-left"
        >
          {isDark ? (
            <Moon className="size-5 text-primary" />
          ) : (
            <Sun className="size-5 text-primary" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Appearance</div>
            <div className="text-xs text-muted-foreground">
              {isDark ? "Dark mode" : "Light mode"}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Tap to switch</div>
        </button>

        <div className="flex items-center px-4 py-4 gap-3">
          <Flame className="size-5 text-priority-high" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Streak</div>
            <div className="text-xs text-muted-foreground">
              Days clearing all your high priorities
            </div>
          </div>
          <div className="text-lg font-semibold">{streak.count}</div>
        </div>

        <div className="flex items-center px-4 py-4 gap-3">
          <div className="size-5 rounded-full bg-secondary" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Tasks stored</div>
            <div className="text-xs text-muted-foreground">Saved on this device</div>
          </div>
          <div className="text-lg font-semibold">{totalTasks}</div>
        </div>
      </section>

      <section className="mt-6">
        <button
          onClick={reset}
          className="w-full rounded-2xl bg-destructive/10 text-destructive py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
        >
          <Trash2 className="size-4" />
          Reset all data
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Clarity stores everything locally on this device. No account needed.
        </p>
      </section>
    </AppShell>
  );
}
