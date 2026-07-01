import { createFileRoute, Link } from "@tanstack/react-router";
import { Moon, Sun, Flame, Trash2, Wallet, ListChecks, LogIn, LogOut, Cloud, UserCircle2, Palette, Type as TypeIcon, Square, Sparkles, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/clarity/AppShell";
import { setCurrency, toggleTheme, useStore, clearLocalOnly, setAppearance, resetAppearance, type Palette as PaletteKey, type FontStyle, type RadiusStyle, type Density, type BgStyle } from "@/lib/store";
import { useAuth, signOut } from "@/lib/auth";

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
  const total = useStore((s) => s.items.length);
  const currency = useStore((s) => s.currency);
  const userId = useStore((s) => s.userId);
  const { user } = useAuth();
  const isDark = theme === "dark";

  function reset() {
    if (typeof window === "undefined") return;
    if (confirm("Delete all items on this device?")) {
      clearLocalOnly();
    }
  }

  const name = (user?.user_metadata?.name as string | undefined)
    ?? (user?.user_metadata?.full_name as string | undefined)
    ?? user?.email?.split("@")[0];

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-8">Settings</h1>

      {/* Account */}
      <section className="rounded-3xl bg-card border border-border overflow-hidden mb-6">
        {userId ? (
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/15 grid place-items-center">
                <UserCircle2 className="size-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{name ?? "Signed in"}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-tint-mint px-2 py-1 rounded-full">
                <Cloud className="size-3" /> Synced
              </div>
            </div>
            <button
              onClick={() => void signOut()}
              className="mt-4 w-full h-11 rounded-2xl border border-border text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-secondary transition"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        ) : (
          <Link to="/auth" className="block p-5 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/15 grid place-items-center">
                <LogIn className="size-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Sign in or create account</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Sync across devices · backed up securely
                </div>
              </div>
            </div>
          </Link>
        )}
      </section>

      {/* Preferences */}
      <section className="rounded-3xl bg-card border border-border divide-y divide-border overflow-hidden">
        <button onClick={toggleTheme} className="flex items-center w-full px-5 py-4 gap-3 text-left hover:bg-secondary/40 transition">
          {isDark ? <Moon className="size-5 text-primary" /> : <Sun className="size-5 text-primary" />}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Appearance</div>
            <div className="text-xs text-muted-foreground">{isDark ? "Soft dark" : "Pastel light"}</div>
          </div>
          <div className="text-xs text-muted-foreground">Tap to switch</div>
        </button>

        <div className="flex items-center px-5 py-4 gap-3">
          <Wallet className="size-5 text-emerald-700" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Currency</div>
            <div className="text-xs text-muted-foreground">Used for money items</div>
          </div>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
            className="w-16 rounded-lg bg-surface border border-border px-2 py-1 text-sm text-right"
          />
        </div>

        <div className="flex items-center px-5 py-4 gap-3">
          <Flame className="size-5 text-orange-600" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Streak</div>
            <div className="text-xs text-muted-foreground">Days clearing all high priorities</div>
          </div>
          <div className="text-lg font-semibold">{streak.count}</div>
        </div>

        <div className="flex items-center px-5 py-4 gap-3">
          <ListChecks className="size-5 text-violet-700" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Items</div>
            <div className="text-xs text-muted-foreground">{userId ? "Synced to your account" : "Saved on this device"}</div>
          </div>
          <div className="text-lg font-semibold">{total}</div>
        </div>
      </section>

      <section className="mt-8">
        <button onClick={reset} className="w-full rounded-2xl bg-destructive/10 text-destructive py-3 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-destructive/15 transition">
          <Trash2 className="size-4" /> Clear all items
        </button>
      </section>
    </AppShell>
  );
}
