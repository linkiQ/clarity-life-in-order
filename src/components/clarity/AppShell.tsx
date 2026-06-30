import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { AddSheet } from "./AddSheet";
import { AuthSync } from "./AuthSync";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-xl px-5 sm:px-6 pt-8 pb-36 safe-top">{children}</main>

      <button
        onClick={() => setOpen(true)}
        aria-label="New item"
        className="fixed z-40 bottom-28 right-5 sm:right-6 size-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center active:scale-95 hover:scale-105 transition-transform"
      >
        <Plus className="size-6" />
      </button>

      <AddSheet open={open} onClose={() => setOpen(false)} />
      <BottomNav />
      <AuthSync />
    </div>
  );
}
