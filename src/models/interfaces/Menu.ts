// src/models/interfaces/Menu.ts
import type { components } from "../../api/schema";

type Schemas = components["schemas"];

// CMS menus (FRONTEND_GUIDE §3 / §7 "Menu builder"). Response types derive from the generated OpenAPI schema (src/api/schema.d.ts).

/** Server-side max lengths (pydantic Field max_length). */
export const MENU_LIMITS = {
  menuName: 150,
  location: 50,
  itemLabel: 150,
  itemUrl: 500,
} as const;

export type MenuItemTargetType = Schemas["MenuItemTargetType"];

export type CmsMenuSummary = Schemas["MenuSummary"];

/** `resolved_url` is computed by the server; `null` = target missing/unpublished: the site must not render a link. */
export type CmsMenuItem = Schemas["MenuItemOut"];

export type CmsMenu = Schemas["MenuOut"];

export interface MenuInput {
  name: string;
  slug?: string;
  location?: string | null;
}

export interface MenuItemInput {
  label: string;
  target_type: MenuItemTargetType;
  url?: string | null;
  target_id?: number | null;
  parent_id?: number | null;
  order?: number;
  open_in_new_tab?: boolean;
  is_active?: boolean;
}

/** One row of POST /cms/menus/{id}/items/reorder (the whole flat list is sent). */
export interface MenuReorderEntry {
  id: number;
  parent_id: number | null;
  order: number;
}
