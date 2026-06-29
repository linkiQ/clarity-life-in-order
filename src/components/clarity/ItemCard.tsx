import { useState } from "react";
import { Check, Clock, Repeat, Trash2, MapPin, Users, Store as StoreIcon, Calendar as CalIcon } from "lucide-react";
import {
  cyclePriority, deleteItem, isOverdue, toggleComplete, updateItem, updateDetails,
  type Item,
} from "@/lib/store";
import { TYPE_META } from "./itemMeta";

const priorityRing: Record<string, string> = {
  high: "bg-priority-high ring-priority-high/30",
  medium: "bg-priority-medium ring-priority-medium/30",
  low: "bg-priority-low ring-priority-low/30",
};

function formatWhen(ts: number, withTime = true) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = withTime
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "";
  if (sameDay) return withTime ? `Today · ${time}` : "Today";
  if (isTomorrow) return withTime ? `Tomorrow · ${time}` : "Tomorrow";
  const date = d.toLocaleDateString([], { month: "short", day: "numeric" });
  return withTime ? `${date} · ${time}` : date;
}

export function ItemCard({ item }: { item: Item }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;
  const done = !!item.completedAt;
  const overdue = isOverdue(item);
  const completable = item.type !== "note" && item.type !== "idea";

  return (
    <div
      className={`animate-task-enter rounded-2xl bg-card border border-border px-3 py-3 transition-all ${
        done ? "opacity-60" : ""
      } ${overdue && !done ? "ring-1 ring-priority-high/30" : ""}`}
    >
      <div className="flex items-start gap-3">
        {completable ? (
          <button
            onClick={() => toggleComplete(item.id)}
            aria-label={done ? "Mark as not done" : "Complete"}
            className={`mt-0.5 size-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              done ? "bg-primary border-primary" : "border-muted-foreground/30 hover:border-primary"
            }`}
          >
            {done && <Check className="size-3.5 text-primary-foreground animate-check-pop" />}
          </button>
        ) : (
          <div className={`mt-0.5 size-6 rounded-full flex items-center justify-center shrink-0 ${meta.tint}`}>
            <Icon className={`size-3.5 ${meta.text}`} />
          </div>
        )}

        {completable && (
          <button
            onClick={() => cyclePriority(item.id)}
            aria-label={`Priority: ${item.priority}`}
            className={`mt-1.5 size-3 rounded-full shrink-0 ring-4 ${priorityRing[item.priority]}`}
          />
        )}

        <div className="flex-1 min-w-0">
          <button onClick={() => setExpanded((v) => !v)} className="block w-full text-left">
            <div className="flex items-start gap-2">
              <div className={`text-[15px] leading-snug flex-1 min-w-0 ${
                done ? "line-through text-muted-foreground" : "text-foreground"
              }`}>
                {item.title}
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5 ${meta.tint} ${meta.text}`}>
                <Icon className="size-3" />
                {meta.label}
              </span>
            </div>

            <DetailLine item={item} overdue={overdue} />
          </button>

          {expanded && <Expanded item={item} />}
        </div>
      </div>
    </div>
  );
}

function DetailLine({ item, overdue }: { item: Item; overdue: boolean }) {
  const bits: React.ReactNode[] = [];
  if (item.dueAt) {
    bits.push(
      <span key="due" className={`inline-flex items-center gap-1 ${overdue ? "text-priority-high" : ""}`}>
        <Clock className="size-3" /> {formatWhen(item.dueAt)}
      </span>
    );
  } else if (item.scheduledFor) {
    bits.push(
      <span key="sched" className={`inline-flex items-center gap-1 ${overdue ? "text-priority-high" : ""}`}>
        <CalIcon className="size-3" /> {formatWhen(item.scheduledFor, false)}
      </span>
    );
  }
  if (item.recurrence !== "none") {
    bits.push(<span key="rec" className="inline-flex items-center gap-1"><Repeat className="size-3" />{item.recurrence}</span>);
  }
  if (item.type === "financial") {
    const d = item.details as { direction?: string; amount?: number; currency?: string; person?: string };
    const arrow = d.direction === "owed_to_me" ? "←" : "→";
    bits.push(
      <span key="fin" className={`font-medium ${d.direction === "owed_to_me" ? "text-emerald-700" : "text-rose-700"}`}>
        {arrow} {d.currency ?? ""} {(d.amount ?? 0).toFixed(2)} {d.person ? `· ${d.person}` : ""}
      </span>
    );
  }
  if (item.type === "appointment") {
    const d = item.details as { location?: string; withWhom?: string };
    if (d.withWhom) bits.push(<span key="w" className="inline-flex items-center gap-1"><Users className="size-3" />{d.withWhom}</span>);
    if (d.location) bits.push(<span key="loc" className="inline-flex items-center gap-1"><MapPin className="size-3" />{d.location}</span>);
  }
  if (item.type === "shopping") {
    const d = item.details as { quantity?: number; store?: string; price?: number };
    if (d.quantity) bits.push(<span key="q">×{d.quantity}</span>);
    if (d.price) bits.push(<span key="p">${d.price.toFixed(2)}</span>);
    if (d.store) bits.push(<span key="s" className="inline-flex items-center gap-1"><StoreIcon className="size-3" />{d.store}</span>);
  }
  if (item.type === "bill") {
    const d = item.details as { amount?: number; payee?: string };
    bits.push(<span key="b" className="font-medium text-amber-800">${(d.amount ?? 0).toFixed(2)} {d.payee ? `· ${d.payee}` : ""}</span>);
  }
  if (item.type === "goal") {
    const d = item.details as { progress?: number; targetDate?: number };
    bits.push(
      <span key="g" className="inline-flex items-center gap-2 w-full">
        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${d.progress ?? 0}%` }} />
        </div>
        <span className="text-[11px]">{d.progress ?? 0}%</span>
      </span>
    );
    if (d.targetDate) bits.push(<span key="td">by {formatWhen(d.targetDate, false)}</span>);
  }
  if (item.type === "habit") {
    const d = item.details as { streak?: number };
    if (d.streak) bits.push(<span key="st">🔥 {d.streak} day streak</span>);
  }
  if ((item.type === "note" || item.type === "idea")) {
    const d = item.details as { body?: string };
    if (d.body) bits.push(<span key="body" className="line-clamp-1">{d.body}</span>);
  }

  if (bits.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {bits}
    </div>
  );
}

function Expanded({ item }: { item: Item }) {
  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalIcon className="size-3.5" /> Day
        <input
          type="date"
          className="ml-auto bg-surface rounded-md px-2 py-1 text-xs text-foreground border border-border"
          value={item.scheduledFor ? new Date(item.scheduledFor - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) : ""}
          onChange={(e) => updateItem(item.id, { scheduledFor: e.target.value ? new Date(e.target.value).getTime() : null })}
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3.5" /> Due
        <input
          type="datetime-local"
          className="ml-auto bg-surface rounded-md px-2 py-1 text-xs text-foreground border border-border"
          value={item.dueAt ? new Date(item.dueAt - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
          onChange={(e) => updateItem(item.id, { dueAt: e.target.value ? new Date(e.target.value).getTime() : null })}
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Repeat className="size-3.5" /> Repeat
        <select
          className="ml-auto bg-surface rounded-md px-2 py-1 text-xs text-foreground border border-border"
          value={item.recurrence}
          onChange={(e) => updateItem(item.id, { recurrence: e.target.value as Item["recurrence"] })}
        >
          <option value="none">Never</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>

      {item.type === "goal" && (
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Progress</span>
            <span>{(item.details as { progress?: number }).progress ?? 0}%</span>
          </div>
          <input
            type="range" min={0} max={100}
            value={(item.details as { progress?: number }).progress ?? 0}
            onChange={(e) => updateDetails(item.id, { progress: parseInt(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      )}

      {item.notes && (
        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
      )}

      <button
        onClick={() => deleteItem(item.id)}
        className="w-full rounded-lg bg-destructive/10 text-destructive text-xs font-medium py-1.5 inline-flex items-center justify-center gap-1.5"
      >
        <Trash2 className="size-3.5" /> Delete
      </button>
    </div>
  );
}
