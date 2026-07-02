import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  addItem, startOfDay, type ItemType, type NewItemInput, type Priority, type Recurrence,
} from "@/lib/store";
import { TYPE_META, TYPE_ORDER, PRIORITY_LABEL } from "./itemMeta";

interface Props {
  open: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialType?: ItemType;
  initialScheduled?: number | null;
}

function toLocalInput(ts: number | null) {
  if (!ts) return "";
  const d = new Date(ts - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}
function toDateInput(ts: number | null) {
  if (!ts) return "";
  const d = new Date(ts - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}

export function AddSheet({ open, onClose, initialTitle = "", initialType = "task", initialScheduled = null }: Props) {
  const [type, setType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState(initialTitle);
  const [priority, setPriority] = useState<Priority>("medium");
  const [scheduledFor, setScheduledFor] = useState<number | null>(initialScheduled);
  const [dueAt, setDueAt] = useState<number | null>(null);
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [notes, setNotes] = useState("");

  // type-specific
  const [amount, setAmount] = useState("");
  const [person, setPerson] = useState("");
  const [direction, setDirection] = useState<"owed_to_me" | "i_owe">("owed_to_me");
  const [currency, setCurrency] = useState("USD");
  const [location, setLocation] = useState("");
  const [withWhom, setWithWhom] = useState("");
  const [quantity, setQuantity] = useState("");
  const [store, setStore] = useState("");
  const [price, setPrice] = useState("");
  const [payee, setPayee] = useState("");
  const [account, setAccount] = useState("");
  const [targetDate, setTargetDate] = useState<number | null>(null);
  const [progress, setProgress] = useState("0");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setType(initialType);
      setScheduledFor(initialScheduled);
      setPriority("medium");
      setDueAt(null);
      setRecurrence("none");
      setNotes("");
      setAmount(""); setPerson(""); setDirection("owed_to_me"); setCurrency("USD");
      setLocation(""); setWithWhom("");
      setQuantity(""); setStore(""); setPrice("");
      setPayee(""); setAccount("");
      setTargetDate(null); setProgress("0");
      setBody("");
    }
  }, [open, initialTitle, initialType, initialScheduled]);

  if (!open) return null;

  const meta = TYPE_META[type];

  function submit() {
    const clean = title.trim().slice(0, 500);
    if (!clean) return;
    const details: Record<string, unknown> = {};
    switch (type) {
      case "financial":
        details.direction = direction;
        details.amount = parseFloat(amount) || 0;
        details.currency = currency;
        details.person = person;
        break;
      case "appointment":
        details.location = location;
        details.withWhom = withWhom;
        break;
      case "shopping":
        details.quantity = quantity ? parseInt(quantity) : undefined;
        details.store = store;
        details.price = price ? parseFloat(price) : undefined;
        break;
      case "bill":
        details.amount = parseFloat(amount) || 0;
        details.payee = payee;
        details.account = account;
        break;
      case "goal":
        details.targetDate = targetDate;
        details.progress = parseInt(progress) || 0;
        break;
      case "habit":
        details.streak = 0;
        break;
      case "note":
      case "idea":
        details.body = body;
        break;
    }
    const input: NewItemInput = {
      title, type, priority,
      scheduledFor: scheduledFor ?? (type === "idea" ? null : scheduledFor),
      dueAt, recurrence, notes: notes || undefined, details,
    };
    addItem(input);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/30 backdrop-blur-sm p-3" onClick={onClose}>
      <div
        className="animate-sheet-up w-full max-w-lg rounded-3xl bg-card shadow-2xl border border-border max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-5 py-3 flex items-center justify-between rounded-t-3xl">
          <h2 className="font-display font-semibold text-lg">New {meta.label.toLowerCase()}</h2>
          <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Type chooser */}
          <div>
            <Label>What kind?</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {TYPE_ORDER.map((k) => {
                const m = TYPE_META[k];
                const active = k === type;
                const Icon = m.icon;
                return (
                  <button
                    key={k}
                    onClick={() => setType(k)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-xs border transition-all ${
                      active
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-surface hover:bg-muted"
                    }`}
                  >
                    <div className={`size-9 rounded-xl flex items-center justify-center ${m.tint}`}>
                      <Icon className={`size-4 ${m.text}`} />
                    </div>
                    <span className="font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{meta.hint}</p>
          </div>

          {/* Title */}
          <div>
            <Label>Title</Label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder(type)}
              className="mt-1.5 w-full rounded-xl bg-surface border border-border px-3 py-2.5 text-base outline-none focus:border-primary"
            />
          </div>

          {/* Type-specific fields */}
          {type === "financial" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDirection("owed_to_me")}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${direction === "owed_to_me" ? "bg-tint-mint border-emerald-300 text-emerald-800" : "border-border bg-surface"}`}
                >They owe me</button>
                <button
                  onClick={() => setDirection("i_owe")}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${direction === "i_owe" ? "bg-tint-rose border-rose-300 text-rose-800" : "border-border bg-surface"}`}
                >I owe them</button>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Field label="Amount">
                  <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={inputCls} />
                </Field>
                <Field label="Currency">
                  <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))} className={`${inputCls} w-20`} />
                </Field>
              </div>
              <Field label="Person">
                <input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Who?" className={inputCls} />
              </Field>
            </div>
          )}

          {type === "appointment" && (
            <div className="space-y-3">
              <Field label="Location"><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Address or link" className={inputCls} /></Field>
              <Field label="With"><input value={withWhom} onChange={(e) => setWithWhom(e.target.value)} placeholder="Who's joining?" className={inputCls} /></Field>
            </div>
          )}

          {type === "shopping" && (
            <div className="grid grid-cols-3 gap-2">
              <Field label="Qty"><input inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" className={inputCls} /></Field>
              <Field label="Price"><input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className={inputCls} /></Field>
              <Field label="Store"><input value={store} onChange={(e) => setStore(e.target.value)} placeholder="Where" className={inputCls} /></Field>
            </div>
          )}

          {type === "bill" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Amount"><input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={inputCls} /></Field>
                <Field label="Payee"><input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="Who to pay" className={inputCls} /></Field>
              </div>
              <Field label="Account"><input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Optional" className={inputCls} /></Field>
            </div>
          )}

          {type === "goal" && (
            <div className="space-y-3">
              <Field label="Target date">
                <input type="date" value={toDateInput(targetDate)} onChange={(e) => setTargetDate(e.target.value ? new Date(e.target.value).getTime() : null)} className={inputCls} />
              </Field>
              <Field label={`Progress · ${progress}%`}>
                <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(e.target.value)} className="w-full accent-primary" />
              </Field>
            </div>
          )}

          {(type === "note" || type === "idea") && (
            <Field label="Details">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Anything you want to remember…" className={`${inputCls} resize-none`} />
            </Field>
          )}

          {/* Scheduling — shown for everything except notes/ideas */}
          {type !== "idea" && type !== "note" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Pick a day">
                  <input
                    type="date"
                    value={toDateInput(scheduledFor)}
                    onChange={(e) => setScheduledFor(e.target.value ? startOfDay(new Date(e.target.value).getTime()) : null)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Due time">
                  <input
                    type="datetime-local"
                    value={toLocalInput(dueAt)}
                    onChange={(e) => setDueAt(e.target.value ? new Date(e.target.value).getTime() : null)}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickDates().map((q) => (
                  <button key={q.label}
                    onClick={() => setScheduledFor(q.ts)}
                    className="text-xs rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground hover:bg-accent">
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Priority */}
          <Field label="Priority">
            <div className="grid grid-cols-3 gap-2">
              {(["high", "medium", "low"] as Priority[]).map((p) => (
                <button key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    priority === p
                      ? p === "high" ? "bg-priority-high/15 border-priority-high/40 text-priority-high"
                        : p === "medium" ? "bg-priority-medium/20 border-priority-medium/40 text-amber-800"
                        : "bg-priority-low/20 border-priority-low/40 text-emerald-800"
                      : "bg-surface border-border text-muted-foreground"
                  }`}
                >{PRIORITY_LABEL[p]}</button>
              ))}
            </div>
          </Field>

          {/* Recurrence */}
          {type !== "idea" && type !== "note" && (
            <Field label="Repeat">
              <div className="grid grid-cols-4 gap-2">
                {(["none", "daily", "weekly", "monthly"] as Recurrence[]).map((r) => (
                  <button key={r}
                    onClick={() => setRecurrence(r)}
                    className={`rounded-xl border px-2 py-2 text-xs font-medium capitalize ${
                      recurrence === r
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface border-border text-muted-foreground"
                    }`}
                  >{r === "none" ? "Never" : r}</button>
                ))}
              </div>
            </Field>
          )}

          {/* Notes */}
          <Field label="Notes (optional)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Extra context…" className={`${inputCls} resize-none`} />
          </Field>
        </div>

        <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border p-4 flex gap-2 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 rounded-xl bg-secondary text-secondary-foreground py-2.5 font-medium">Cancel</button>
          <button onClick={submit} disabled={!title.trim()} className="flex-[2] rounded-xl bg-primary text-primary-foreground py-2.5 font-semibold disabled:opacity-50">
            Add {meta.label.toLowerCase()}
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
const inputCls = "w-full rounded-xl bg-surface border border-border px-3 py-2 text-sm outline-none focus:border-primary";

function quickDates() {
  const now = startOfDay(Date.now());
  return [
    { label: "Today", ts: now },
    { label: "Tomorrow", ts: now + 86400000 },
    { label: "In 3 days", ts: now + 3 * 86400000 },
    { label: "Next week", ts: now + 7 * 86400000 },
  ];
}
function titlePlaceholder(t: ItemType): string {
  switch (t) {
    case "financial": return "e.g. Dinner split with Alex";
    case "appointment": return "e.g. Dentist checkup";
    case "shopping": return "e.g. Olive oil";
    case "bill": return "e.g. Electricity bill";
    case "habit": return "e.g. Stretch 10 minutes";
    case "goal": return "e.g. Read 12 books this year";
    case "note": return "e.g. Wi-Fi password";
    case "idea": return "e.g. Birthday surprise for mom";
    default: return "What needs doing?";
  }
}
