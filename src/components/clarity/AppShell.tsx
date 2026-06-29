import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-xl px-4 pt-6 pb-32 safe-top">{children}</main>
      <BottomNav />
    </div>
  );
}
