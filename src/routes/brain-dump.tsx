import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/clarity/AppShell";
import { Capture } from "@/components/clarity/Capture";
import { ItemList } from "@/components/clarity/ItemList";
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
  const items = useStore((s) => s.items);
  const ideas = items.filter((i) => (i.type === "idea" || i.type === "note") && !i.completedAt);
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Brain dump</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Stash thoughts, ideas, and reminders without committing to a day.
      </p>

      <ItemList items={ideas} empty="Empty mind. Capture stray thoughts below." />

      {/* Thumb-reach capture: fixed above the bottom nav */}
      <div className="fixed inset-x-0 z-30 bottom-24 sm:bottom-24 safe-bottom pointer-events-none">
        <div className="mx-auto max-w-xl px-5 sm:px-6 pointer-events-auto">
          <Capture defaultType="idea" scheduleToday={false} placeholder="Don't lose this thought…" />
        </div>
      </div>
    </AppShell>
  );
}
