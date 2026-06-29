import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/clarity/AppShell";
import { QuickCapture } from "@/components/clarity/QuickCapture";
import { TaskList } from "@/components/clarity/TaskList";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/brain-dump")({
  head: () => ({
    meta: [
      { title: "Clarity — Brain Dump" },
      { name: "description", content: "Park anything you don't want to forget." },
    ],
  }),
  component: BrainDumpPage,
});

function BrainDumpPage() {
  const tasks = useStore((s) => s.tasks.filter((t) => t.brainDump && !t.completedAt));
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Brain dump</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Park anything here. Promote it to Today when you're ready.
      </p>

      <div className="mb-6">
        <QuickCapture
          defaultBrainDump
          placeholder="Don't lose this thought…"
        />
      </div>

      <TaskList
        tasks={tasks}
        empty="Empty mind. Capture stray thoughts above."
      />
    </AppShell>
  );
}
