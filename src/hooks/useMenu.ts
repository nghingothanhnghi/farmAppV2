// src/hooks/useMenu.ts
import { useState, useCallback, useEffect } from "react";
import { menuService } from "../services/menuService";
import type {
    CmsMenu,
    CmsMenuSummary,
    MenuInput,
    MenuItemInput,
    MenuReorderEntry,
} from "../models/interfaces/Menu";
import { getApiErrorMessage } from "../utils/apiError";

/** Menu list (summaries, no items). */
export const useMenus = () => {
    const [menus, setMenus] = useState<CmsMenuSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMenus = useCallback(async () => {
        setLoading(true);
        try {
            const data = await menuService.getAll();
            setMenus(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setMenus([]);
            setError(getApiErrorMessage(err, "Failed loading menus"));
        } finally {
            setLoading(false);
        }
    }, []);

    const createMenu = useCallback(async (data: MenuInput) => {
        const created = await menuService.create(data);
        setMenus(prev => [...prev, created]);
        return created;
    }, []);

    const updateMenu = useCallback(async (id: number, data: Partial<MenuInput>) => {
        const updated = await menuService.update(id, data);
        setMenus(prev => prev.map(m => (m.id === id ? { ...m, ...updated } : m)));
        return updated;
    }, []);

    const deleteMenu = useCallback(async (id: number) => {
        await menuService.delete(id);
        setMenus(prev => prev.filter(m => m.id !== id));
    }, []);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    return {
        menus,
        loading,
        error,
        actions: { fetchMenus, createMenu, updateMenu, deleteMenu },
    };
};

/** One menu with its full item tree (inactive items included) for the builder. */
export const useMenuBuilder = (menuId: number) => {
    const [menu, setMenu] = useState<CmsMenu | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMenu = useCallback(async () => {
        setLoading(true);
        try {
            setMenu(await menuService.getById(menuId, false));
            setError(null);
        } catch (err: any) {
            setMenu(null);
            setError(getApiErrorMessage(err, "Failed loading menu"));
        } finally {
            setLoading(false);
        }
    }, [menuId]);

    // Item writes reload the menu afterwards: the server owns ordering and `resolved_url`.
    const withSaving = useCallback(async <T,>(run: () => Promise<T>) => {
        setSaving(true);
        try {
            return await run();
        } finally {
            setSaving(false);
        }
    }, []);

    const createItem = useCallback(
        (data: MenuItemInput) =>
            withSaving(async () => {
                const created = await menuService.createItem(menuId, data);
                await fetchMenu();
                return created;
            }),
        [menuId, fetchMenu, withSaving]
    );

    const updateItem = useCallback(
        (itemId: number, data: Partial<MenuItemInput>) =>
            withSaving(async () => {
                const updated = await menuService.updateItem(itemId, data);
                await fetchMenu();
                return updated;
            }),
        [fetchMenu, withSaving]
    );

    const deleteItem = useCallback(
        (itemId: number) =>
            withSaving(async () => {
                await menuService.deleteItem(itemId);
                await fetchMenu();
            }),
        [fetchMenu, withSaving]
    );

    /** The response is the new tree, so no extra fetch is needed. */
    const reorder = useCallback(
        (entries: MenuReorderEntry[]) =>
            withSaving(async () => {
                const tree = await menuService.reorder(menuId, entries);
                setMenu(prev => (prev ? { ...prev, items: tree } : prev));
                return tree;
            }),
        [menuId, withSaving]
    );

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    return {
        menu,
        items: menu?.items ?? [],
        loading,
        saving,
        error,
        actions: { fetchMenu, createItem, updateItem, deleteItem, reorder },
    };
};
