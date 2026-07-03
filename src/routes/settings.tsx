import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Moon, Sun, Flame, Trash2, Wallet, ListChecks, LogIn, LogOut, Cloud, UserCircle2, Palette, Type as TypeIcon, Square, Sparkles, RotateCcw, ChevronDown, Zap, LayoutGrid, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/clarity/AppShell";
import { setCurrency, toggleTheme, useStore, clearLocalOnly, setAppearance, resetAppearance, type Palette as PaletteKey, type FontStyle, type RadiusStyle, type Density, type BgStyle, type ItemType, type TodayStat } from "@/lib/store";
import { TYPE_META, TYPE_ORDER } from "@/components/clarity/itemMeta";
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

      {/* Appearance customization */}
      <AppearanceSection />

      {/* Quick actions */}
      <QuickActionsSection />

      {/* Preferences */}
      <section className="rounded-3xl bg-card border border-border divide-y divide-border overflow-hidden mt-6">


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

const PALETTES: { key: PaletteKey; label: string; swatch: string }[] = [
  { key: "lilac",  label: "Lilac",  swatch: "oklch(0.72 0.13 320)" },
  { key: "mint",   label: "Mint",   swatch: "oklch(0.72 0.13 165)" },
  { key: "peach",  label: "Peach",  swatch: "oklch(0.74 0.13 45)" },
  { key: "sky",    label: "Sky",    swatch: "oklch(0.72 0.13 230)" },
  { key: "rose",   label: "Rose",   swatch: "oklch(0.72 0.15 10)" },
  { key: "sand",   label: "Sand",   swatch: "oklch(0.66 0.09 70)" },
  { key: "mono",   label: "Mono",   swatch: "oklch(0.35 0.02 285)" },
];
const FONTS: { key: FontStyle; label: string; sample: string; family: string }[] = [
  { key: "modern",  label: "Modern",  sample: "Aa", family: '-apple-system, "SF Pro Text", "Inter", system-ui, sans-serif' },
  { key: "rounded", label: "Rounded", sample: "Aa", family: 'ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif' },
  { key: "serif",   label: "Serif",   sample: "Aa", family: '"Iowan Old Style", "Palatino", "Georgia", ui-serif, serif' },
  { key: "mono",    label: "Mono",    sample: "Aa", family: 'ui-monospace, "SF Mono", "JetBrains Mono", "Menlo", monospace' },
];
const RADII: { key: RadiusStyle; label: string; r: string }[] = [
  { key: "soft",   label: "Soft",   r: "1rem" },
  { key: "medium", label: "Medium", r: "0.5rem" },
  { key: "sharp", label: "Sharp",   r: "0.15rem" },
];
const DENSITIES: { key: Density; label: string }[] = [
  { key: "cozy", label: "Cozy" },
  { key: "compact", label: "Compact" },
];
const BGS: { key: BgStyle; label: string }[] = [
  { key: "aurora", label: "Aurora" },
  { key: "clean",  label: "Clean" },
  { key: "grain",  label: "Grain" },
  { key: "grid",   label: "Grid" },
];

function AppearanceSection() {
  const a = useStore((s) => s.appearance);
  const theme = useStore((s) => s.theme);
  const isDark = theme === "dark";
  const [advanced, setAdvanced] = useState(false);
  return (
    <section className="rounded-3xl bg-card border border-border overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Make it yours</h2>
        <button
          onClick={resetAppearance}
          className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> Reset
        </button>
      </div>

      {/* Palette */}
      <Group icon={<Palette className="size-4" />} label="Color palette">
        <div className="grid grid-cols-4 gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.key}
              onClick={() => setAppearance({ palette: p.key })}
              className={`group relative flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 transition ${
                a.palette === p.key ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"
              }`}
            >
              <span className="size-7 rounded-full shadow-sm ring-1 ring-black/5" style={{ background: p.swatch }} />
              <span className="text-[11px] font-medium">{p.label}</span>
            </button>
          ))}
        </div>
      </Group>

      {/* Always-visible: Theme toggle for quick light/dark */}
      <Group label="Mode">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { if (isDark) toggleTheme(); }}
            className={`rounded-2xl border py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 transition ${
              !isDark ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
            }`}
          >
            <Sun className="size-4" /> Light
          </button>
          <button
            onClick={() => { if (!isDark) toggleTheme(); }}
            className={`rounded-2xl border py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 transition ${
              isDark ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
            }`}
          >
            <Moon className="size-4" /> Dark
          </button>
        </div>
      </Group>

      {/* Advanced disclosure */}
      <div className="px-5 py-3 border-t border-border">
        <button
          onClick={() => setAdvanced((v) => !v)}
          aria-expanded={advanced}
          className="w-full inline-flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground min-h-11"
        >
          <span>Advanced customization</span>
          <ChevronDown className={`size-4 transition-transform ${advanced ? "rotate-180" : ""}`} />
        </button>
      </div>

      {advanced && (
        <>
          {/* Font */}
          <Group icon={<TypeIcon className="size-4" />} label="Typography">
            <div className="grid grid-cols-4 gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setAppearance({ font: f.key })}
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-2.5 transition ${
                    a.font === f.key ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"
                  }`}
                >
                  <span className="text-lg" style={{ fontFamily: f.family }}>{f.sample}</span>
                  <span className="text-[11px] font-medium">{f.label}</span>
                </button>
              ))}
            </div>
          </Group>

          {/* Radius */}
          <Group icon={<Square className="size-4" />} label="Corner style">
            <div className="grid grid-cols-3 gap-2">
              {RADII.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setAppearance({ radius: r.key })}
                  className={`flex flex-col items-center gap-1.5 border p-2.5 transition ${
                    a.radius === r.key ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"
                  }`}
                  style={{ borderRadius: "1rem" }}
                >
                  <span className="w-10 h-6 bg-primary/70" style={{ borderRadius: r.r }} />
                  <span className="text-[11px] font-medium">{r.label}</span>
                </button>
              ))}
            </div>
          </Group>

          <Group label="Density">
            <div className="grid grid-cols-2 gap-2">
              {DENSITIES.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setAppearance({ density: d.key })}
                  className={`rounded-2xl border py-2.5 text-sm font-medium transition ${
                    a.density === d.key ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </Group>

          <Group label="Background">
            <div className="grid grid-cols-4 gap-2">
              {BGS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setAppearance({ background: b.key })}
                  className={`rounded-2xl border py-2.5 text-xs font-medium transition ${
                    a.background === b.key ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </Group>
        </>
      )}
    </section>
  );
}

const TODAY_STATS: { key: TodayStat; label: string; icon: typeof Flame }[] = [
  { key: "streak", label: "Streak", icon: Flame },
  { key: "urgent", label: "Urgent", icon: AlertCircle },
  { key: "total",  label: "Remaining", icon: ListChecks },
  { key: "done",   label: "Completed", icon: CheckCircle2 },
];

function QuickActionsSection() {
  const a = useStore((s) => s.appearance);
  const selected = a.todayStats ?? [];

  function toggleStat(k: TodayStat) {
    const has = selected.includes(k);
    let next: TodayStat[];
    if (has) next = selected.filter((s) => s !== k);
    else if (selected.length >= 2) next = [selected[1], k]; // keep max 2, drop oldest
    else next = [...selected, k];
    setAppearance({ todayStats: next });
  }

  return (
    <section className="rounded-3xl bg-card border border-border overflow-hidden mt-6">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <Zap className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Quick actions</h2>
      </div>

      <Group icon={<LayoutGrid className="size-4" />} label="Long-press “+” default">
        <p className="text-xs text-muted-foreground mb-3 -mt-2">
          Tap the floating “+” to open this type instantly. Long-press or swipe up for the full menu.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_ORDER.map((k) => {
            const m = TYPE_META[k];
            const Icon = m.icon;
            const active = a.quickAddType === k;
            return (
              <button
                key={k}
                onClick={() => setAppearance({ quickAddType: k as ItemType })}
                className={`flex flex-col items-center gap-1 rounded-2xl border py-3 transition ${
                  active ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"
                }`}
              >
                <span className={`size-8 rounded-full grid place-items-center ${m.tint}`}>
                  <Icon className={`size-4 ${m.text}`} />
                </span>
                <span className="text-[11px] font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group label={`Today header stats · ${selected.length}/2`}>
        <p className="text-xs text-muted-foreground mb-3 -mt-2">
          Pick up to two glanceable stats to show at the top of Today.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TODAY_STATS.map((s) => {
            const Icon = s.icon;
            const active = selected.includes(s.key);
            return (
              <button
                key={s.key}
                onClick={() => toggleStat(s.key)}
                className={`inline-flex items-center gap-2 rounded-2xl border py-2.5 px-3 text-sm font-medium transition ${
                  active ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {s.label}
              </button>
            );
          })}
        </div>
      </Group>
    </section>
  );
}

function Group({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      {children}
    </div>
  );
}

