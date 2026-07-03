import { useRef, useState, type ReactNode } from "react";
import { Check, Trash2, CalendarClock, Flag } from "lucide-react";
import { cyclePriority, deleteItem, scheduleForToday, toggleComplete, type Item } from "@/lib/store";

const ACTION_WIDTH = 168; // px, revealed on left-swipe
const COMPLETE_THRESHOLD = 96; // px right-swipe to complete

/**
 * Native-feel swipe row:
 *   swipe right → complete
 *   swipe left  → reveal quick actions (reschedule / priority / delete)
 * Tap outside the row closes revealed actions.
 */
export function SwipeRow({ item, children }: { item: Item; children: ReactNode }) {
  const [tx, setTx] = useState(0); // current translateX
  const [revealed, setRevealed] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const locked = useRef<"h" | "v" | null>(null);
  const pointerId = useRef<number | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    // Ignore interactive controls inside the row (buttons, inputs).
    const target = e.target as HTMLElement;
    if (target.closest("button, input, select, textarea, a, [role='button']")) {
      return;
    }
    startX.current = e.clientX;
    startY.current = e.clientY;
    locked.current = null;
    pointerId.current = e.pointerId;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current == null || startY.current == null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (locked.current == null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      locked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (locked.current !== "h") return;
    e.preventDefault();
    const base = revealed ? -ACTION_WIDTH : 0;
    const next = Math.max(-ACTION_WIDTH - 40, Math.min(COMPLETE_THRESHOLD + 40, base + dx));
    setTx(next);
  }

  function onPointerUp() {
    const dx = tx;
    startX.current = null;
    startY.current = null;
    if (locked.current === "h") {
      if (dx >= COMPLETE_THRESHOLD) {
        toggleComplete(item.id);
        setTx(0);
        setRevealed(false);
      } else if (dx <= -ACTION_WIDTH / 2) {
        setTx(-ACTION_WIDTH);
        setRevealed(true);
      } else {
        setTx(0);
        setRevealed(false);
      }
    }
    locked.current = null;
    pointerId.current = null;
  }

  function onPointerCancel() {
    startX.current = null;
    startY.current = null;
    locked.current = null;
    setTx(revealed ? -ACTION_WIDTH : 0);
  }

  const completeVisible = tx > 12;
  const completeReady = tx >= COMPLETE_THRESHOLD;

  return (
    <div className="relative">
      {/* Left background (revealed on right-swipe) — Complete */}
      <div
        className={`absolute inset-y-0 left-0 flex items-center pl-4 rounded-2xl transition-colors ${
          completeReady ? "bg-emerald-500" : "bg-emerald-500/70"
        }`}
        style={{ width: Math.max(0, tx), opacity: completeVisible ? 1 : 0 }}
        aria-hidden
      >
        <div className="flex items-center gap-2 text-white font-medium text-sm">
          <Check className="size-5" />
          {completeReady && <span>Release</span>}
        </div>
      </div>

      {/* Right background (revealed on left-swipe) — Actions */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end gap-1 pr-1"
        style={{ width: ACTION_WIDTH }}
        aria-hidden={!revealed}
      >
        <ActionButton
          label="Later"
          tint="bg-tint-sky text-sky-800"
          icon={<CalendarClock className="size-4" />}
          onClick={() => { scheduleForToday(item.id); close(); }}
        />
        <ActionButton
          label="Priority"
          tint="bg-tint-lilac text-violet-800"
          icon={<Flag className="size-4" />}
          onClick={() => { cyclePriority(item.id); close(); }}
        />
        <ActionButton
          label="Delete"
          tint="bg-destructive/15 text-destructive"
          icon={<Trash2 className="size-4" />}
          onClick={() => { deleteItem(item.id); }}
        />
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={() => { if (revealed) close(); }}
        style={{ transform: `translateX(${tx}px)`, touchAction: "pan-y" }}
        className="relative transition-transform duration-200 ease-out"
      >
        {children}
      </div>
    </div>
  );

  function close() { setTx(0); setRevealed(false); }
}

function ActionButton({
  label, icon, onClick, tint,
}: { label: string; icon: ReactNode; onClick: () => void; tint: string }) {
  return (
    <button
      onClick={onClick}
      className={`h-full min-w-[52px] rounded-2xl flex flex-col items-center justify-center gap-0.5 px-2 ${tint} active:scale-95 transition-transform`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
