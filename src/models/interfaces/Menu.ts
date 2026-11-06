// src/models/interfaces/Menu.ts
// CMS menus (FRONTEND_GUIDE §3 / §7 "Menu builder").

export type MenuItemTargetType = "custom" | "category" | "post";

export interface CmsMenuSummary {
  id: number;
  name: string;
  slug: string;
  /** Free-form key the site renders by ("header", "footer", ...). Unique across menus. */
  location: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface CmsMenuItem {
  id: number;
  menu_id: number;
  label: string;
  target_type: MenuItemTargetType;
  /** custom items only */
  url: string | null;
  /** category / post items only */
  target_id: number | null;
  parent_id: number | null;
  order: number;
  open_in_new_tab: boolean;
  is_active: boolean;
  /** Computed by the server. `null` = target missing/unpublished: the site must not render a link. */
  resolved_url: string | null;
  children: CmsMenuItem[];
}

export interface CmsMenu extends CmsMenuSummary {
  items: CmsMenuItem[];
}

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
