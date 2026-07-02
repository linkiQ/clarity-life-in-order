import { Link, useRouterState } from "@tanstack/react-router";
import { Sun, Calendar, ListChecks, Brain, Settings } from "lucide-react";
import type { ComponentType } from "react";

const items: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: "/", label: "Today", icon: Sun },
  { to: "/upcoming", label: "Upcoming", icon: Calendar },
  { to: "/all", label: "All", icon: ListChecks },
  { to: "/brain-dump", label: "Brain", icon: Brain },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 safe-bottom">
      <div className="mx-auto max-w-xl px-3 pb-3">
        <div className="rounded-2xl bg-surface-elevated/95 backdrop-blur border border-border shadow-lg flex items-center justify-around px-1.5 py-1.5">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-11 py-2 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                aria-label={label}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
