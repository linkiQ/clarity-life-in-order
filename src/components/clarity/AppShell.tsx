import { useEffect, useRef, useState, type ReactNode } from "react";
import { Plus, CheckSquare, Receipt, ShoppingBag, Bell, Lightbulb } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { AddSheet } from "./AddSheet";
import { AuthSync } from "./AuthSync";
import type { ItemType } from "@/lib/store";

interface QuickType {
  key: ItemType;
  label: string;
  icon: typeof CheckSquare;
  tint: string;
}

const QUICK_TYPES: QuickType[] = [
  { key: "task", label: "Task", icon: CheckSquare, tint: "bg-tint-lilac text-purple-800" },
  { key: "bill", label: "Bill", icon: Receipt, tint: "bg-tint-peach text-orange-800" },
  { key: "shopping", label: "Shop", icon: ShoppingBag, tint: "bg-tint-mint text-emerald-800" },
  { key: "appointment", label: "Reminder", icon: Bell, tint: "bg-tint-sky text-sky-800" },
  { key: "idea", label: "Idea", icon: Lightbulb, tint: "bg-tint-lemon text-amber-800" },
];

const LONG_PRESS_MS = 380;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialType, setInitialType] = useState<ItemType>("task");
  const [menuOpen, setMenuOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    window.addEventListener("touchstart", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("touchstart", close);
    };
  }, [menuOpen]);

  function openWithType(type: ItemType) {
    setInitialType(type);
    setMenuOpen(false);
    setOpen(true);
  }

  function clearTimer() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    firedRef.current = false;
    startYRef.current = e.clientY;
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true;
      setMenuOpen(true);
      if ("vibrate" in navigator) navigator.vibrate?.(15);
    }, LONG_PRESS_MS);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startYRef.current == null) return;
    const dy = startYRef.current - e.clientY;
    // Swipe up ≥ 40px opens the quick menu.
    if (dy > 40 && !firedRef.current) {
      firedRef.current = true;
      clearTimer();
      setMenuOpen(true);
      if ("vibrate" in navigator) navigator.vibrate?.(15);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    clearTimer();
    startYRef.current = null;
    if (firedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Short tap → open sheet with default task type.
    setInitialType("task");
    setOpen(true);
  }

  function onPointerCancel() {
    clearTimer();
    startYRef.current = null;
  }

  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-xl px-5 sm:px-6 pt-8 pb-36 safe-top">{children}</main>

      {menuOpen && (
        <div
          className="fixed z-40 bottom-44 right-5 sm:right-6 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {QUICK_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => openWithType(t.key)}
                className="flex items-center gap-2.5 rounded-full bg-card border border-border shadow-lg pl-3 pr-4 h-11 min-w-32 active:scale-95 transition-transform"
              >
                <span className={`size-7 rounded-full grid place-items-center ${t.tint}`}>
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="New item (long-press for quick types)"
        className="fixed z-40 bottom-28 right-5 sm:right-6 size-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center active:scale-95 hover:scale-105 transition-transform touch-none select-none"
        style={{ WebkitTouchCallout: "none" }}
      >
        <Plus className={`size-6 transition-transform ${menuOpen ? "rotate-45" : ""}`} />
      </button>

      <AddSheet open={open} onClose={() => setOpen(false)} initialType={initialType} />
      <BottomNav />
      <AuthSync />
    </div>
  );
}
