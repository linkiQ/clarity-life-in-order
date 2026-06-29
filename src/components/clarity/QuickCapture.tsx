import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { addTask, type Priority } from "@/lib/store";

interface Props {
  defaultBrainDump?: boolean;
  placeholder?: string;
  defaultPriority?: Priority;
}

export function QuickCapture({
  defaultBrainDump = false,
  placeholder = "Capture a thought… press Enter",
  defaultPriority = "medium",
}: Props) {
  const [value, setValue] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    addTask({
      title: value,
      brainDump: defaultBrainDump,
      priority: defaultPriority,
      pinnedForToday: !defaultBrainDump,
    });
    setValue("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 rounded-2xl bg-surface-elevated/80 backdrop-blur px-4 py-3 border border-border shadow-sm focus-within:border-primary/60 transition-colors"
    >
      <Plus className="size-5 text-muted-foreground shrink-0" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground min-w-0"
        autoComplete="off"
      />
      {value && (
        <button
          type="submit"
          className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 shrink-0"
        >
          Add
        </button>
      )}
    </form>
  );
}
