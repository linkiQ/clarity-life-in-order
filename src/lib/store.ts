import { useEffect, useSyncExternalStore } from "react";

export type Priority = "high" | "medium" | "low";
export type Recurrence = "none" | "daily" | "weekly" | "monthly";

export type ItemType =
  | "task"
  | "financial"
  | "appointment"
  | "shopping"
  | "habit"
  | "bill"
  | "goal"
  | "note"
  | "idea";

export interface FinancialDetails {
  direction: "owed_to_me" | "i_owe";
  amount: number;
  currency: string;
  person: string;
}
export interface AppointmentDetails {
  location?: string;
  withWhom?: string;
}
export interface ShoppingDetails {
  quantity?: number;
  store?: string;
  price?: number;
}
export interface BillDetails {
  amount: number;
  payee: string;
  account?: string;
}
export interface GoalDetails {
  targetDate?: number;
  progress?: number; // 0–100
}
export interface HabitDetails {
  streak?: number;
  lastCompletedDay?: string | null;
}

export type ItemDetails =
  | { type: "task"; data?: Record<string, never> }
  | { type: "financial"; data: FinancialDetails }
  | { type: "appointment"; data: AppointmentDetails }
  | { type: "shopping"; data: ShoppingDetails }
  | { type: "bill"; data: BillDetails }
  | { type: "goal"; data: GoalDetails }
  | { type: "habit"; data: HabitDetails }
  | { type: "note"; data?: { body?: string } }
  | { type: "idea"; data?: { body?: string } };

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  notes?: string;
  priority: Priority;
  scheduledFor: number | null; // any day pin (start of day ms)
  dueAt: number | null; // specific moment
  createdAt: number;
  completedAt: number | null;
  recurrence: Recurrence;
  details: Record<string, unknown>;
  tags: string[];
}

export type Palette = "lilac" | "mint" | "peach" | "sky" | "sand" | "rose" | "mono";
export type FontStyle = "modern" | "rounded" | "serif" | "mono";
export type RadiusStyle = "soft" | "medium" | "sharp";
export type Density = "cozy" | "compact";
export type BgStyle = "aurora" | "clean" | "grain" | "grid";

export interface Appearance {
  palette: Palette;
  font: FontStyle;
  radius: RadiusStyle;
  density: Density;
  background: BgStyle;
}

export interface AppState {
  items: Item[];
  theme: "dark" | "light";
  focusMode: boolean;
  currency: string;
  streak: { count: number; lastClearedDay: string | null };
  userId: string | null;
  cloudSyncing: boolean;
  migrationPending: boolean; // true when signed in with local items but cloud empty
  appearance: Appearance;
}

const STORAGE_KEY = "clarity:v2";

const defaultAppearance: Appearance = {
  palette: "lilac",
  font: "modern",
  radius: "soft",
  density: "cozy",
  background: "aurora",
};

const defaultState: AppState = {
  items: [],
  theme: "light",
  focusMode: false,
  currency: "USD",
  streak: { count: 0, lastClearedDay: null },
  userId: null,
  cloudSyncing: false,
  migrationPending: false,
  appearance: defaultAppearance,
};

function load(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      appearance: { ...defaultAppearance, ...(parsed.appearance ?? {}) },
    };
  } catch {
    return defaultState;
  }
}

let state: AppState = defaultState;
let hydrated = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const persist = () => {
  if (typeof window !== "undefined") {
    try {
      // Don't persist transient runtime fields.
      const { userId: _u, cloudSyncing: _c, migrationPending: _m, ...rest } = state;
      void _u; void _c; void _m;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch { /* ignore */ }
  }
};
function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

export function applyTheme(theme: "dark" | "light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

export function applyAppearance(a: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.palette = a.palette;
  root.dataset.font = a.font;
  root.dataset.radius = a.radius;
  root.dataset.density = a.density;
  root.dataset.bg = a.background;
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  state = load();
  state = { ...state, items: rollRecurring(state.items) };
  persist();
  applyTheme(state.theme);
  applyAppearance(state.appearance);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  useEffect(() => { hydrate(); }, []);
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(defaultState),
  );
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hydrated,
    () => false,
  );
}

// ---- Theme ----
export function toggleTheme() {
  setState((s) => {
    const theme = s.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    return { ...s, theme };
  });
}
export function toggleFocusMode() {
  setState((s) => ({ ...s, focusMode: !s.focusMode }));
}
export function setCurrency(currency: string) {
  setState((s) => ({ ...s, currency }));
}
export function setAppearance(patch: Partial<Appearance>) {
  setState((s) => {
    const next = { ...s.appearance, ...patch };
    applyAppearance(next);
    return { ...s, appearance: next };
  });
}
export function resetAppearance() {
  setState((s) => {
    applyAppearance(defaultAppearance);
    return { ...s, appearance: defaultAppearance };
  });
}

// ---- helpers ----
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
export const dayKey = (ts: number | Date = Date.now()) => {
  const d = typeof ts === "number" ? new Date(ts) : ts;
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

function rollRecurring(items: Item[]): Item[] {
  const today = dayKey();
  return items.map((it) => {
    if (it.recurrence === "none" || !it.completedAt) return it;
    if (dayKey(it.completedAt) === today) return it;
    const elapsed = Date.now() - it.completedAt;
    const reset =
      (it.recurrence === "daily") ||
      (it.recurrence === "weekly" && elapsed > 7 * 86400000) ||
      (it.recurrence === "monthly" && elapsed > 28 * 86400000);
    return reset ? { ...it, completedAt: null } : it;
  });
}

// ---- CRUD ----
export interface NewItemInput {
  title: string;
  type?: ItemType;
  priority?: Priority;
  scheduledFor?: number | null;
  dueAt?: number | null;
  recurrence?: Recurrence;
  notes?: string;
  details?: Record<string, unknown>;
  tags?: string[];
}

export function addItem(input: NewItemInput): Item | undefined {
  const title = input.title.trim();
  if (!title) return undefined;
  const item: Item = {
    id: uid(),
    type: input.type ?? "task",
    title,
    notes: input.notes,
    priority: input.priority ?? "medium",
    scheduledFor: input.scheduledFor ?? null,
    dueAt: input.dueAt ?? null,
    createdAt: Date.now(),
    completedAt: null,
    recurrence: input.recurrence ?? "none",
    details: input.details ?? {},
    tags: input.tags ?? [],
  };
  setState((s) => ({ ...s, items: [item, ...s.items] }));
  syncUpsert(item);
  return item;
}

export function updateItem(id: string, patch: Partial<Item>) {
  setState((s) => ({
    ...s,
    items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  }));
  const found = state.items.find((i) => i.id === id);
  if (found) syncUpsert(found);
}
export function updateDetails(id: string, patch: Record<string, unknown>) {
  setState((s) => ({
    ...s,
    items: s.items.map((i) =>
      i.id === id ? { ...i, details: { ...i.details, ...patch } } : i,
    ),
  }));
  const found = state.items.find((i) => i.id === id);
  if (found) syncUpsert(found);
}
export function cyclePriority(id: string) {
  setState((s) => ({
    ...s,
    items: s.items.map((i) => {
      if (i.id !== id) return i;
      const next: Priority =
        i.priority === "high" ? "medium" : i.priority === "medium" ? "low" : "high";
      return { ...i, priority: next };
    }),
  }));
  const found = state.items.find((i) => i.id === id);
  if (found) syncUpsert(found);
}
export function toggleComplete(id: string) {
  setState((s) => {
    const items = s.items.map((i) =>
      i.id === id ? { ...i, completedAt: i.completedAt ? null : Date.now() } : i,
    );
    return { ...s, items, streak: recomputeStreak(items, s.streak) };
  });
  const found = state.items.find((i) => i.id === id);
  if (found) syncUpsert(found);
}
export function deleteItem(id: string) {
  setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }));
  syncDelete(id);
}
export function scheduleForToday(id: string) {
  updateItem(id, { scheduledFor: startOfDay(Date.now()) });
}

// ---- cloud sync ----
import { fetchCloudItems, upsertCloudItem, bulkUpsert, deleteCloudItem, deleteAllCloudItems } from "./cloudSync";

function syncUpsert(item: Item) {
  if (!state.userId) return;
  void upsertCloudItem(state.userId, item);
}
function syncDelete(id: string) {
  if (!state.userId) return;
  void deleteCloudItem(state.userId, id);
}

export async function bindUser(userId: string | null) {
  if (state.userId === userId) return;
  if (!userId) {
    setState((s) => ({ ...s, userId: null, migrationPending: false }));
    return;
  }
  setState((s) => ({ ...s, userId, cloudSyncing: true }));
  try {
    const cloud = await fetchCloudItems(userId);
    const local = state.items;
    if (cloud.length === 0 && local.length > 0) {
      // Ask user what to do with local items
      setState((s) => ({ ...s, migrationPending: true, cloudSyncing: false }));
      return;
    }
    // Cloud has items — replace local with cloud (cloud is source of truth)
    setState((s) => ({ ...s, items: cloud, cloudSyncing: false, migrationPending: false }));
  } catch (e) {
    console.error("cloud load failed", e);
    setState((s) => ({ ...s, cloudSyncing: false }));
  }
}

export async function resolveMigration(keep: boolean) {
  const uid = state.userId;
  if (!uid) {
    setState((s) => ({ ...s, migrationPending: false }));
    return;
  }
  if (keep) {
    await bulkUpsert(uid, state.items);
  } else {
    await deleteAllCloudItems(uid);
    setState((s) => ({ ...s, items: [] }));
  }
  setState((s) => ({ ...s, migrationPending: false }));
}

export function clearLocalOnly() {
  setState((s) => ({ ...s, items: [], streak: { count: 0, lastClearedDay: null } }));
}

function recomputeStreak(items: Item[], current: AppState["streak"]): AppState["streak"] {
  const today = dayKey();
  const todays = items.filter((i) => isTodayItem(i) && i.priority === "high" && i.type !== "note" && i.type !== "idea");
  if (todays.length === 0) return current;
  if (!todays.every((t) => t.completedAt)) return current;
  if (current.lastClearedDay === today) return current;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const count = current.lastClearedDay === dayKey(y) ? current.count + 1 : 1;
  return { count, lastClearedDay: today };
}

// ---- selectors / sorting ----
const PR: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function sortItems(items: Item[]) {
  return [...items].sort((a, b) => {
    if (PR[a.priority] !== PR[b.priority]) return PR[a.priority] - PR[b.priority];
    const aDue = a.dueAt ?? a.scheduledFor ?? Number.POSITIVE_INFINITY;
    const bDue = b.dueAt ?? b.scheduledFor ?? Number.POSITIVE_INFINITY;
    if (aDue !== bDue) return aDue - bDue;
    return b.createdAt - a.createdAt;
  });
}

export function isTodayItem(i: Item): boolean {
  if (i.type === "idea") return false;
  const today = dayKey();
  if (i.scheduledFor && dayKey(i.scheduledFor) === today) return true;
  if (i.dueAt) {
    if (dayKey(i.dueAt) === today) return true;
    if (!i.completedAt && i.dueAt < Date.now()) return true; // overdue
  }
  return false;
}

export function isOverdue(i: Item): boolean {
  if (i.completedAt) return false;
  if (i.dueAt && i.dueAt < Date.now()) return true;
  if (i.scheduledFor && i.scheduledFor < startOfDay(Date.now())) return true;
  return false;
}

export function isUpcoming(i: Item, days: number = 14): boolean {
  if (i.completedAt) return false;
  const horizon = startOfDay(Date.now()) + days * 86400000;
  const when = i.dueAt ?? i.scheduledFor;
  if (!when) return false;
  return when >= startOfDay(Date.now()) && when <= horizon;
}
