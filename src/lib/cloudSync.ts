import { supabase } from "@/integrations/supabase/client";
import type { Item } from "./store";

// JSONB column — cast to any to bypass strict Json type.
type Row = { id: string; user_id: string; data: unknown };

export async function fetchCloudItems(userId: string): Promise<Item[]> {
  const { data, error } = await supabase.from("items").select("data").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.data as unknown as Item);
}

export async function upsertCloudItem(userId: string, item: Item) {
  const row: Row = { id: item.id, user_id: userId, data: item };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("items").upsert(row as any, { onConflict: "id" });
  if (error) console.error("cloud upsert failed", error);
}

export async function bulkUpsert(userId: string, items: Item[]) {
  if (!items.length) return;
  const rows: Row[] = items.map((i) => ({ id: i.id, user_id: userId, data: i }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("items").upsert(rows as any, { onConflict: "id" });
  if (error) console.error("cloud bulk upsert failed", error);
}

export async function deleteCloudItem(userId: string, id: string) {
  const { error } = await supabase.from("items").delete().eq("user_id", userId).eq("id", id);
  if (error) console.error("cloud delete failed", error);
}

export async function deleteAllCloudItems(userId: string) {
  const { error } = await supabase.from("items").delete().eq("user_id", userId);
  if (error) console.error("cloud wipe failed", error);
}
