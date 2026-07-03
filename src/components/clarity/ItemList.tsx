import { sortItems, type Item } from "@/lib/store";
import { ItemCard } from "./ItemCard";
import { SwipeRow } from "./SwipeRow";

export function ItemList({ items, empty, presorted }: { items: Item[]; empty?: string; presorted?: boolean }) {
  if (items.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-8">{empty ?? "Nothing here."}</div>;
  }
  const list = presorted ? items : sortItems(items);
  return (
    <div className="flex flex-col gap-2">
      {list.map((i) => (
        <SwipeRow key={i.id} item={i}>
          <ItemCard item={i} />
        </SwipeRow>
      ))}
    </div>
  );
}
