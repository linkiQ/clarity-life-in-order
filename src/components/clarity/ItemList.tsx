import { sortItems, type Item } from "@/lib/store";
import { ItemCard } from "./ItemCard";

export function ItemList({ items, empty, presorted }: { items: Item[]; empty?: string; presorted?: boolean }) {
  if (items.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-8">{empty ?? "Nothing here."}</div>;
  }
  const list = presorted ? items : sortItems(items);
  return (
    <div className="flex flex-col gap-2">
      {list.map((i) => <ItemCard key={i.id} item={i} />)}
    </div>
  );
}
