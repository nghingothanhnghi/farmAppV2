// src/services/menuService.ts
import apiClient from "../api/client";
import type {
    CmsMenu,
    CmsMenuItem,
    CmsMenuSummary,
    MenuInput,
    MenuItemInput,
    MenuReorderEntry,
} from "../models/interfaces/Menu";

export interface MenuReference {
    menuId: number;
    menuName: string;
    itemLabel: string;
}

const collectRefs = (
    items: CmsMenuItem[],
    menu: { id: number; name: string },
    postId: number,
    out: MenuReference[]
) => {
    for (const item of items) {
        if (item.target_type === "post" && item.target_id === postId) {
            out.push({ menuId: menu.id, menuName: menu.name, itemLabel: item.label });
        }
        if (item.children?.length) collectRefs(item.children, menu, postId, out);
    }
};

export const menuService = {
    /**
     * Menu items pointing at a post. The backend does not guard post deletion (the item just stops
     * resolving), so this is a client-side check: list menus, load each tree, scan for the post.
     * Best effort: a menu that fails to load is skipped.
     */
    async findPostReferences(postId: number): Promise<MenuReference[]> {
        const menus = await menuService.getAll();
        const trees = await Promise.all(
            menus.map((m) => menuService.getById(m.id, false).catch(() => null))
        );
        const out: MenuReference[] = [];
        trees.forEach((tree, i) => {
            if (tree) collectRefs(tree.items ?? [], menus[i], postId, out);
        });
        return out;
    },

    /** Summaries only: no `items`. */
    async getAll(): Promise<CmsMenuSummary[]> {
        const res = await apiClient.get("/cms/menus");
        return res.data;
    },

    /** `activeOnly=false` includes inactive items (needed by the builder). */
    async getById(id: number, activeOnly = false): Promise<CmsMenu> {
        const res = await apiClient.get(`/cms/menus/${id}`, { params: { active_only: activeOnly } });
        return res.data;
    },

    /** Public rendering: 404 when no menu uses this location. */
    async getByLocation(location: string, activeOnly = true): Promise<CmsMenu> {
        const res = await apiClient.get(`/cms/menus/location/${encodeURIComponent(location)}`, {
            params: { active_only: activeOnly },
        });
        return res.data;
    },

    /** 400 when `location` is already used by another menu. */
    async create(data: MenuInput): Promise<CmsMenuSummary> {
        const res = await apiClient.post("/cms/menus", data);
        return res.data;
    },

    async update(id: number, data: Partial<MenuInput>): Promise<CmsMenuSummary> {
        const res = await apiClient.put(`/cms/menus/${id}`, data);
        return res.data;
    },

    /** Admin only. Also deletes the menu's items. */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/cms/menus/${id}`);
    },

    async createItem(menuId: number, data: MenuItemInput): Promise<CmsMenuItem> {
        const res = await apiClient.post(`/cms/menus/${menuId}/items`, data);
        return res.data;
    },

    async updateItem(itemId: number, data: Partial<MenuItemInput>): Promise<CmsMenuItem> {
        const res = await apiClient.put(`/cms/menus/items/${itemId}`, data);
        return res.data;
    },

    /** Also deletes the item's children. */
    async deleteItem(itemId: number): Promise<void> {
        await apiClient.delete(`/cms/menus/items/${itemId}`);
    },

    /** Send the ENTIRE flat list; the response is the new tree. Cycles → 400. */
    async reorder(menuId: number, items: MenuReorderEntry[]): Promise<CmsMenuItem[]> {
        const res = await apiClient.post(`/cms/menus/${menuId}/items/reorder`, { items });
        return res.data;
    },
};
