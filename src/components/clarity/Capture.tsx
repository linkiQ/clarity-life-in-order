import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Plus, Sparkles, Clock } from "lucide-react";
import { addItem, startOfDay, type ItemType } from "@/lib/store";
import { parseNaturalDate } from "@/lib/naturalDate";
import { AddSheet } from "./AddSheet";

const MAX_TITLE = 500;

export function Capture({
  placeholder = "Capture anything…",
  defaultType = "task",
  scheduleToday = true,
  autoFocus = false,
}: {
  placeholder?: string;
  defaultType?: ItemType;
  scheduleToday?: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      // Delay so the on-screen keyboard opens after layout settles.
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const preview = useMemo(() => {
    if (!value.trim()) return null;
    const p = parseNaturalDate(value);
    if (!p.dueAt && !p.scheduledFor) return null;
    return p;
  }, [value]);

  function quick(e: FormEvent) {
    e.preventDefault();
    const raw = value.trim().slice(0, MAX_TITLE);
    if (!raw) return;
    const parsed = parseNaturalDate(raw);
    const title = (parsed.title || raw).slice(0, MAX_TITLE);
    const fallback =
      scheduleToday && defaultType !== "idea" ? startOfDay(Date.now()) : null;
    addItem({
      title,
      type: defaultType,
      scheduledFor: parsed.scheduledFor ?? fallback,
      dueAt: parsed.dueAt ?? null,
    });
    setValue("");
    // Keep focus for rapid capture on mobile.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <>
      <form
        onSubmit={quick}
        className="flex items-center gap-2 rounded-2xl bg-surface-elevated/90 backdrop-blur px-3 py-2.5 border border-border shadow-sm focus-within:border-primary/60 transition-colors"
      >
        <Plus className="size-5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_TITLE))}
          maxLength={MAX_TITLE}
          placeholder={placeholder}
          enterKeyHint="done"
          autoCapitalize="sentences"
          autoCorrect="on"
          className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground min-w-0"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="text-xs font-medium rounded-lg bg-secondary text-secondary-foreground px-2.5 py-2 inline-flex items-center gap-1 shrink-0 min-h-11"
          aria-label="More options"
        >
          <Sparkles className="size-3.5" />
          Details
        </button>
        {value && (
          <button
            type="submit"
            className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-3 py-2 shrink-0 min-h-11"
          >
            Add
          </button>
        )}
      </form>

      {preview && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground px-1">
          <Clock className="size-3.5 text-primary" />
          <span>
            Will schedule for{" "}
            <span className="text-foreground font-medium">
              {formatPreview(preview.dueAt ?? preview.scheduledFor!)}
            </span>
          </span>
        </div>
      )}

      <AddSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initialTitle={value}
        initialType={defaultType}
        initialScheduled={
          scheduleToday && defaultType !== "idea" ? startOfDay(Date.now()) : null
        }
      />
    </>
  );
}

function formatPreview(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const opts: Intl.DateTimeFormatOptions = sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
  return d.toLocaleString([], opts);
}
