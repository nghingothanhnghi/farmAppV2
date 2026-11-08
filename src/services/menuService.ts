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

export const menuService = {
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
