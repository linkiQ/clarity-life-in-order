import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { AddSheet } from "./AddSheet";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-xl px-4 pt-6 pb-32 safe-top">{children}</main>

      <button
        onClick={() => setOpen(true)}
        aria-label="New item"
        className="fixed z-40 bottom-24 right-4 sm:right-6 size-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="size-6" />
      </button>

      <AddSheet open={open} onClose={() => setOpen(false)} />
      <BottomNav />
    </div>
  );
}
