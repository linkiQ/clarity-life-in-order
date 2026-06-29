import { useEffect, useSyncExternalStore } from "react";

export type Priority = "high" | "medium" | "low";
export type Recurrence = "none" | "daily" | "weekly";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueAt: number | null; // ms epoch
  createdAt: number;
  completedAt: number | null;
  pinnedForToday: boolean;
  brainDump: boolean; // unprioritized capture
  recurrence: Recurrence;
}

export interface AppState {
  tasks: Task[];
  theme: "dark" | "light";
  focusMode: boolean;
  streak: { count: number; lastClearedDay: string | null };
}

const STORAGE_KEY = "clarity:v1";

const defaultState: AppState = {
  tasks: [],
  theme: "dark",
  focusMode: false,
  streak: { count: 0, lastClearedDay: null },
};

function load(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

let state: AppState = defaultState;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  state = load();
  // Roll recurring completed tasks back to active for the new day
  state = { ...state, tasks: rollRecurringTasks(state.tasks) };
  persist();
  applyTheme(state.theme);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  // Hydrate once on the client
  useEffect(() => {
    hydrate();
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(defaultState),
  );
}

// ---- Theme ----
export function applyTheme(theme: "dark" | "light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  }
}

export function toggleTheme() {
  setState((s) => {
    const theme = s.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    return { ...s, theme };
  });
}

// ---- Focus mode ----
export function toggleFocusMode() {
  setState((s) => ({ ...s, focusMode: !s.focusMode }));
}

// ---- Helpers ----
const dayKey = (d: Date | number = new Date()) => {
  const date = typeof d === "number" ? new Date(d) : d;
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const todayKey = () => dayKey(new Date());

function rollRecurringTasks(tasks: Task[]): Task[] {
  const today = todayKey();
  return tasks.map((t) => {
    if (t.recurrence === "none" || !t.completedAt) return t;
    const completedDay = dayKey(t.completedAt);
    if (completedDay === today) return t;
    if (t.recurrence === "daily") {
      return { ...t, completedAt: null };
    }
    if (t.recurrence === "weekly") {
      const diff = Date.now() - t.completedAt;
      if (diff > 7 * 24 * 60 * 60 * 1000) return { ...t, completedAt: null };
    }
    return t;
  });
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// ---- Task actions ----
export function addTask(input: {
  title: string;
  priority?: Priority;
  brainDump?: boolean;
  dueAt?: number | null;
  pinnedForToday?: boolean;
  recurrence?: Recurrence;
}) {
  const title = input.title.trim();
  if (!title) return;
  const task: Task = {
    id: uid(),
    title,
    priority: input.priority ?? "medium",
    dueAt: input.dueAt ?? null,
    createdAt: Date.now(),
    completedAt: null,
    pinnedForToday: input.pinnedForToday ?? !input.brainDump,
    brainDump: input.brainDump ?? false,
    recurrence: input.recurrence ?? "none",
  };
  setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
}

export function updateTask(id: string, patch: Partial<Task>) {
  setState((s) => ({
    ...s,
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  }));
}

export function cyclePriority(id: string) {
  setState((s) => ({
    ...s,
    tasks: s.tasks.map((t) => {
      if (t.id !== id) return t;
      const next: Priority =
        t.priority === "high" ? "medium" : t.priority === "medium" ? "low" : "high";
      return { ...t, priority: next };
    }),
  }));
}

export function toggleComplete(id: string) {
  setState((s) => {
    const tasks = s.tasks.map((t) =>
      t.id === id ? { ...t, completedAt: t.completedAt ? null : Date.now() } : t,
    );
    const streak = recomputeStreak(tasks, s.streak);
    return { ...s, tasks, streak };
  });
}

export function deleteTask(id: string) {
  setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
}

export function promoteFromBrainDump(id: string, priority: Priority = "medium") {
  updateTask(id, { brainDump: false, pinnedForToday: true, priority });
}

function recomputeStreak(tasks: Task[], current: AppState["streak"]): AppState["streak"] {
  const today = todayKey();
  const todayHigh = tasks.filter((t) => isTodayTask(t) && t.priority === "high");
  if (todayHigh.length === 0) return current;
  const allDone = todayHigh.every((t) => t.completedAt);
  if (!allDone) return current;
  if (current.lastClearedDay === today) return current;
  // Continue streak if last cleared was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = dayKey(yesterday);
  const count = current.lastClearedDay === yKey ? current.count + 1 : 1;
  return { count, lastClearedDay: today };
}

// ---- Selectors / sorting ----
const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority])
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    const aDue = a.dueAt ?? Number.POSITIVE_INFINITY;
    const bDue = b.dueAt ?? Number.POSITIVE_INFINITY;
    if (aDue !== bDue) return aDue - bDue;
    return b.createdAt - a.createdAt;
  });
}

export function isTodayTask(t: Task): boolean {
  if (t.brainDump) return false;
  if (t.pinnedForToday) return true;
  if (t.dueAt) {
    const d = new Date(t.dueAt);
    const now = new Date();
    if (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
      return true;
    if (t.dueAt < Date.now() && !t.completedAt) return true; // overdue still shows today
  }
  return false;
}

export function isOverdue(t: Task): boolean {
  return !!t.dueAt && !t.completedAt && t.dueAt < Date.now();
}
