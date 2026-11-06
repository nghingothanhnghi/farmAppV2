// src/utils/menuTree.ts
// Pure helpers for the menu builder. The server returns items as a tree (`children`, sorted by
// `order`) and expects the ENTIRE flat list back on reorder, so every move is: tree → new tree → flat.
import type { CmsMenuItem, MenuReorderEntry } from "../models/interfaces/Menu";

export type MoveAction = "up" | "down" | "indent" | "outdent";

/** Tree → flat list for POST .../items/reorder. `order` is the 0-based index among siblings. */
export const flattenForReorder = (
  items: CmsMenuItem[],
  parentId: number | null = null
): MenuReorderEntry[] =>
  items.flatMap((item, index) => [
    { id: item.id, parent_id: parentId, order: index },
    ...flattenForReorder(item.children ?? [], item.id),
  ]);

interface Location {
  siblings: CmsMenuItem[];
  index: number;
  parentSiblings: CmsMenuItem[] | null; // list that contains the parent (null at top level)
  parentIndex: number;
}

const locate = (
  list: CmsMenuItem[],
  id: number,
  parentSiblings: CmsMenuItem[] | null = null,
  parentIndex = -1
): Location | null => {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return { siblings: list, index: i, parentSiblings, parentIndex };
    const found = locate(list[i].children ?? [], id, list, i);
    if (found) return found;
  }
  return null;
};

const clone = (items: CmsMenuItem[]): CmsMenuItem[] => JSON.parse(JSON.stringify(items));

export const canMove = (items: CmsMenuItem[], id: number, action: MoveAction): boolean => {
  const loc = locate(items, id);
  if (!loc) return false;
  switch (action) {
    case "up":
    case "indent":
      return loc.index > 0; // indent = become last child of the previous sibling
    case "down":
      return loc.index < loc.siblings.length - 1;
    case "outdent":
      return loc.parentSiblings !== null;
  }
};

/** Returns a new tree with the item moved, or null when the move isn't possible. */
export const moveItem = (
  items: CmsMenuItem[],
  id: number,
  action: MoveAction
): CmsMenuItem[] | null => {
  if (!canMove(items, id, action)) return null;
  const tree = clone(items);
  const loc = locate(tree, id)!;
  const { siblings, index } = loc;

  if (action === "up" || action === "down") {
    const target = action === "up" ? index - 1 : index + 1;
    [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
  } else if (action === "indent") {
    const [item] = siblings.splice(index, 1);
    const newParent = siblings[index - 1];
    newParent.children = [...(newParent.children ?? []), item];
  } else {
    const [item] = siblings.splice(index, 1);
    loc.parentSiblings!.splice(loc.parentIndex + 1, 0, item); // right after its old parent
  }
  return tree;
};

export interface FlatOption {
  id: number;
  label: string;
  depth: number;
}

/** Depth-first list for <select> parent pickers; skips `excludeId` and its whole subtree. */
export const flattenForSelect = (
  items: CmsMenuItem[],
  excludeId?: number,
  depth = 0
): FlatOption[] =>
  items.flatMap((item) =>
    item.id === excludeId
      ? []
      : [
          { id: item.id, label: item.label, depth },
          ...flattenForSelect(item.children ?? [], excludeId, depth + 1),
        ]
  );

/** Number of siblings under `parentId`, i.e. the `order` for a new last child. */
export const countChildren = (items: CmsMenuItem[], parentId: number | null): number => {
  if (parentId === null) return items.length;
  const loc = locate(items, parentId);
  return loc ? (loc.siblings[loc.index].children ?? []).length : 0;
};
