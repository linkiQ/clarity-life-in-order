import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Item } from "./store";

// JSONB column — cast to any to bypass strict Json type.
type Row = { id: string; user_id: string; data: unknown };

function reportError(action: string, error: unknown) {
  console.error(`cloud ${action} failed`, error);
  const message = error instanceof Error ? error.message : "Please try again.";
  toast.error(`Sync failed: ${action}`, { description: message });
}

export async function fetchCloudItems(userId: string): Promise<Item[]> {
  try {
    const { data, error } = await supabase.from("items").select("data").eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((row) => row.data as unknown as Item);
  } catch (error) {
    reportError("load", error);
    throw error;
  }
}

export async function upsertCloudItem(userId: string, item: Item) {
  try {
    const row: Row = { id: item.id, user_id: userId, data: item };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from("items").upsert(row as any, { onConflict: "id" });
    if (error) throw error;
  } catch (error) {
    reportError("save", error);
  }
}

export async function bulkUpsert(userId: string, items: Item[]) {
  if (!items.length) return;
  try {
    const rows: Row[] = items.map((i) => ({ id: i.id, user_id: userId, data: i }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from("items").upsert(rows as any, { onConflict: "id" });
    if (error) throw error;
  } catch (error) {
    reportError("sync", error);
  }
}

export async function deleteCloudItem(userId: string, id: string) {
  try {
    const { error } = await supabase.from("items").delete().eq("user_id", userId).eq("id", id);
    if (error) throw error;
  } catch (error) {
    reportError("delete", error);
  }
}

export async function deleteAllCloudItems(userId: string) {
  try {
    const { error } = await supabase.from("items").delete().eq("user_id", userId);
    if (error) throw error;
  } catch (error) {
    reportError("wipe", error);
  }
}
