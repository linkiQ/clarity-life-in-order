import { useState, type FormEvent } from "react";
import { Plus, Sparkles } from "lucide-react";
import { addItem, startOfDay, type ItemType } from "@/lib/store";
import { AddSheet } from "./AddSheet";

export function Capture({
  placeholder = "Capture anything…",
  defaultType = "task",
  scheduleToday = true,
}: {
  placeholder?: string;
  defaultType?: ItemType;
  scheduleToday?: boolean;
}) {
  const [value, setValue] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  function quick(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    addItem({
      title: value,
      type: defaultType,
      scheduledFor: scheduleToday && defaultType !== "idea" ? startOfDay(Date.now()) : null,
    });
    setValue("");
  }

  return (
    <>
      <form
        onSubmit={quick}
        className="flex items-center gap-2 rounded-2xl bg-surface-elevated/90 backdrop-blur px-3 py-2.5 border border-border shadow-sm focus-within:border-primary/60 transition-colors"
      >
        <Plus className="size-5 text-muted-foreground shrink-0" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground min-w-0"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="text-xs font-medium rounded-lg bg-secondary text-secondary-foreground px-2.5 py-1.5 inline-flex items-center gap-1 shrink-0"
          aria-label="More options"
        >
          <Sparkles className="size-3.5" />
          Details
        </button>
        {value && (
          <button type="submit" className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 shrink-0">
            Add
          </button>
        )}
      </form>
      <AddSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initialTitle={value}
        initialType={defaultType}
        initialScheduled={scheduleToday && defaultType !== "idea" ? startOfDay(Date.now()) : null}
      />
    </>
  );
}
