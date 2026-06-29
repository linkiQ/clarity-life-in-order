import { useState } from "react";
import { Check, Clock, Repeat, Trash2, Calendar } from "lucide-react";
import {
  cyclePriority,
  deleteTask,
  isOverdue,
  toggleComplete,
  updateTask,
  type Task,
} from "@/lib/store";

const priorityStyles: Record<string, { dot: string; ring: string; label: string }> = {
  high: { dot: "bg-priority-high", ring: "ring-priority-high/40", label: "High" },
  medium: { dot: "bg-priority-medium", ring: "ring-priority-medium/40", label: "Medium" },
  low: { dot: "bg-priority-low", ring: "ring-priority-low/40", label: "Low" },
};

function formatDue(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return time;
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " · " + time;
}

export function TaskItem({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const ps = priorityStyles[task.priority];
  const overdue = isOverdue(task);
  const done = !!task.completedAt;

  return (
    <div
      className={`animate-task-enter rounded-2xl bg-card border border-border px-3 py-3 transition-all ${
        done ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => toggleComplete(task.id)}
          aria-label={done ? "Mark as not done" : "Complete task"}
          className={`mt-0.5 size-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            done
              ? "bg-primary border-primary"
              : "border-muted-foreground/40 hover:border-primary"
          }`}
        >
          {done && <Check className="size-3.5 text-primary-foreground animate-check-pop" />}
        </button>

        <button
          onClick={() => cyclePriority(task.id)}
          aria-label={`Priority: ${ps.label}. Tap to change.`}
          className={`mt-1.5 size-3 rounded-full shrink-0 ring-4 ${ps.dot} ${ps.ring}`}
        />

        <div className="flex-1 min-w-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="block w-full text-left"
          >
            <div
              className={`text-[15px] leading-snug ${
                done ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.title}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {task.dueAt && (
                <span
                  className={`inline-flex items-center gap-1 ${
                    overdue ? "text-priority-high" : ""
                  }`}
                >
                  <Clock className="size-3" />
                  {formatDue(task.dueAt)}
                </span>
              )}
              {task.recurrence !== "none" && (
                <span className="inline-flex items-center gap-1">
                  <Repeat className="size-3" />
                  {task.recurrence}
                </span>
              )}
              {task.brainDump && <span className="text-muted-foreground/70">· brain dump</span>}
            </div>
          </button>

          {expanded && (
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                Due
                <input
                  type="datetime-local"
                  className="ml-auto bg-surface-elevated rounded-md px-2 py-1 text-xs text-foreground border border-border"
                  value={
                    task.dueAt
                      ? new Date(task.dueAt - new Date().getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    updateTask(task.id, {
                      dueAt: e.target.value ? new Date(e.target.value).getTime() : null,
                    })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Repeat className="size-3.5" />
                Repeat
                <select
                  className="ml-auto bg-surface-elevated rounded-md px-2 py-1 text-xs text-foreground border border-border"
                  value={task.recurrence}
                  onChange={(e) =>
                    updateTask(task.id, { recurrence: e.target.value as Task["recurrence"] })
                  }
                >
                  <option value="none">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
              {task.brainDump ? (
                <button
                  onClick={() =>
                    updateTask(task.id, { brainDump: false, pinnedForToday: true })
                  }
                  className="w-full rounded-lg bg-primary text-primary-foreground text-xs font-medium py-1.5"
                >
                  Move to Today
                </button>
              ) : (
                <button
                  onClick={() =>
                    updateTask(task.id, {
                      pinnedForToday: !task.pinnedForToday,
                    })
                  }
                  className="w-full rounded-lg bg-secondary text-secondary-foreground text-xs font-medium py-1.5"
                >
                  {task.pinnedForToday ? "Unpin from Today" : "Pin to Today"}
                </button>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="w-full rounded-lg bg-destructive/10 text-destructive text-xs font-medium py-1.5 inline-flex items-center justify-center gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
