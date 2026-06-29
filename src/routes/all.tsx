import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/clarity/AppShell";
import { QuickCapture } from "@/components/clarity/QuickCapture";
import { TaskList } from "@/components/clarity/TaskList";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/all")({
  head: () => ({
    meta: [
      { title: "Clarity — All Tasks" },
      { name: "description", content: "Every task across Clarity." },
    ],
  }),
  component: AllPage,
});

function AllPage() {
  const tasks = useStore((s) => s.tasks);
  const sections = [
    { key: "high", label: "High priority", color: "text-priority-high" },
    { key: "medium", label: "Medium", color: "text-priority-medium" },
    { key: "low", label: "Low", color: "text-priority-low" },
  ] as const;

  const active = tasks.filter((t) => !t.completedAt);
  const completed = tasks.filter((t) => t.completedAt);

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-1">All tasks</h1>
      <p className="text-sm text-muted-foreground mb-5">
        {active.length} active · {completed.length} done
      </p>

      <div className="mb-6">
        <QuickCapture />
      </div>

      <div className="space-y-7">
        {sections.map((s) => {
          const list = active.filter((t) => t.priority === s.key);
          if (list.length === 0) return null;
          return (
            <section key={s.key}>
              <h2
                className={`text-sm font-semibold uppercase tracking-wider mb-3 ${s.color}`}
              >
                {s.label} · {list.length}
              </h2>
              <TaskList tasks={list} />
            </section>
          );
        })}

        {completed.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Completed · {completed.length}
            </h2>
            <TaskList tasks={completed} />
          </section>
        )}

        {tasks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No tasks yet. Capture one above.
          </p>
        )}
      </div>
    </AppShell>
  );
}
