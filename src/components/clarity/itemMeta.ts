import {
  CheckSquare, Wallet, Calendar, ShoppingBag, Repeat, Receipt, Target,
  StickyNote, Lightbulb,
  type LucideIcon,
} from "lucide-react";
import type { ItemType } from "@/lib/store";

export interface TypeMeta {
  key: ItemType;
  label: string;
  hint: string;
  icon: LucideIcon;
  tint: string; // bg utility
  text: string; // text utility for icon
}

export const TYPE_META: Record<ItemType, TypeMeta> = {
  task:        { key: "task",        label: "Task",         hint: "Something to do",                icon: CheckSquare, tint: "bg-tint-sky",   text: "text-sky-700" },
  financial:   { key: "financial",   label: "Money",        hint: "Owed to you or you owe",         icon: Wallet,      tint: "bg-tint-mint",  text: "text-emerald-700" },
  appointment: { key: "appointment", label: "Appointment",  hint: "Meeting, call, event",           icon: Calendar,    tint: "bg-tint-lilac", text: "text-violet-700" },
  shopping:    { key: "shopping",    label: "Shopping",     hint: "Things to buy",                  icon: ShoppingBag, tint: "bg-tint-peach", text: "text-orange-700" },
  habit:       { key: "habit",       label: "Habit",        hint: "Recurring routine",              icon: Repeat,      tint: "bg-tint-rose",  text: "text-rose-700" },
  bill:        { key: "bill",        label: "Bill",         hint: "Payment due",                    icon: Receipt,     tint: "bg-tint-sand",  text: "text-amber-800" },
  goal:        { key: "goal",        label: "Goal",         hint: "Bigger target to track",         icon: Target,      tint: "bg-tint-lemon", text: "text-yellow-800" },
  note:        { key: "note",        label: "Note",         hint: "Info to remember",               icon: StickyNote,  tint: "bg-tint-sand",  text: "text-amber-700" },
  idea:        { key: "idea",        label: "Idea",         hint: "Park it in your brain dump",     icon: Lightbulb,   tint: "bg-tint-lemon", text: "text-yellow-700" },
};

export const TYPE_ORDER: ItemType[] = [
  "task", "appointment", "shopping", "financial", "bill", "habit", "goal", "note", "idea",
];

export const PRIORITY_LABEL: Record<"high" | "medium" | "low", string> = {
  high: "High", medium: "Medium", low: "Low",
};
