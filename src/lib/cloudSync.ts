import { supabase } from "@/integrations/supabase/client";
import type { Item } from "./store";

export async function fetchCloudItems(userId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("data")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.data as unknown as Item);
}

export async function upsertCloudItem(userId: string, item: Item) {
  const { error } = await supabase
    .from("items")
    .upsert(
      { id: item.id, user_id: userId, data: item as unknown as Record<string, unknown> },
      { onConflict: "id" },
    );
  if (error) console.error("cloud upsert failed", error);
}

export async function bulkUpsert(userId: string, items: Item[]) {
  if (!items.length) return;
  const rows = items.map((i) => ({
    id: i.id,
    user_id: userId,
    data: i as unknown as Record<string, unknown>,
  }));
  const { error } = await supabase.from("items").upsert(rows, { onConflict: "id" });
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
