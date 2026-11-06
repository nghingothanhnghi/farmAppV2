// src/components/CMS/CmsMenuBuilderPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
    IconPlus,
    IconArrowLeft,
    IconArrowUp,
    IconArrowDown,
    IconIndentIncrease,
    IconIndentDecrease,
    IconPencil,
    IconTrash,
    IconAlertCircle,
    IconMoodEmpty,
} from "@tabler/icons-react";
import { useMenuBuilder } from "../../hooks/useMenu";
import { useAlert } from "../../contexts/alertContext";
import { useCmsPermissions } from "../../hooks/useCmsPermissions";
import { categoryService } from "../../services/categoryService";
import { postService } from "../../services/postService";
import type { CmsMenuItem, MenuItemInput } from "../../models/interfaces/Menu";
import type { CmsCategory } from "../../models/interfaces/Post";
import { getApiErrorMessage } from "../../utils/apiError";
import { canMove, flattenForReorder, moveItem, type MoveAction } from "../../utils/menuTree";
import PageTitle from "../common/PageTitle";
import LinearProgress from "../common/LinearProgress";
import EmptyState from "../common/EmptyState";
import Modal from "../common/Modal";
import Button from "../common/Button";
import MenuItemFormModal, { type PostOption } from "./components/MenuItemFormModal";

const TARGET_BADGE: Record<string, string> = {
    custom: "Link",
    category: "Category",
    post: "Post",
};

const CmsMenuBuilderPage: React.FC = () => {
    const { id } = useParams();
    const menuId = Number(id);
    const navigate = useNavigate();
    const { setAlert } = useAlert();
    const { canEditMenus } = useCmsPermissions();
    const { menu, items, loading, saving, error, actions } = useMenuBuilder(menuId);

    // Target pickers. Posts: first 100 published (the list endpoint's max page size).
    const [categories, setCategories] = useState<CmsCategory[]>([]);
    const [posts, setPosts] = useState<PostOption[]>([]);

    useEffect(() => {
        categoryService.getAll().then(setCategories).catch(() => setCategories([]));
        postService
            .getAll({ status: "published", page_size: 100, sort: "published_at", order: "desc" })
            .then((res) => setPosts(res.results.map((p) => ({ id: p.id, title: p.title, post_type: p.post_type }))))
            .catch(() => setPosts([]));
    }, []);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<CmsMenuItem | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<CmsMenuItem | null>(null);

    const handleMove = async (item: CmsMenuItem, action: MoveAction) => {
        const next = moveItem(items, item.id, action);
        if (!next) return;
        try {
            await actions.reorder(flattenForReorder(next));
        } catch (err: any) {
            setAlert({ type: "error", message: getApiErrorMessage(err, "Failed to reorder menu.") });
        }
    };

    const handleFormSubmit = async (data: MenuItemInput) => {
        // Errors propagate to the modal, which keeps itself open and shows them.
        if (formMode === "edit" && editing) {
            await actions.updateItem(editing.id, data);
            setAlert({ type: "success", message: "Menu item updated." });
        } else {
            await actions.createItem(data);
            setAlert({ type: "success", message: "Menu item added." });
        }
    };

    const closeDeleteModal = () => {
        setConfirmOpen(false);
        setSelected(null);
    };

    const handleConfirmDelete = async () => {
        if (!selected) return;
        try {
            await actions.deleteItem(selected.id);
            setAlert({ type: "success", message: `"${selected.label}" deleted.` });
        } catch (err: any) {
            setAlert({ type: "error", message: getApiErrorMessage(err, "Failed to delete menu item.") });
        } finally {
            closeDeleteModal();
        }
    };

    const renderItems = (list: CmsMenuItem[], depth = 0): React.ReactNode =>
        list.map((item) => {
            const hidden = item.resolved_url === null; // target missing/unpublished: site skips it
            const disabled = saving || !canEditMenus;
            const control = (
                title: string,
                action: MoveAction,
                icon: React.ReactNode
            ) => (
                <span title={title}>
                    <Button
                        iconOnly
                        size="xs"
                        variant="outline"
                        rounded="lg"
                        icon={icon}
                        disabled={disabled || !canMove(items, item.id, action)}
                        onClick={() => handleMove(item, action)}
                    />
                </span>
            );

            return (
                <React.Fragment key={item.id}>
                    <li
                        className="flex items-center gap-3 py-2 pr-2 border-b border-gray-100 dark:border-gray-800"
                        style={{ paddingLeft: depth * 28 + 8 }}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-medium truncate ${item.is_active ? "" : "text-gray-400 line-through"}`}>
                                    {item.label}
                                </span>
                                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                                    {TARGET_BADGE[item.target_type] ?? item.target_type}
                                </span>
                                {!item.is_active && (
                                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        Inactive
                                    </span>
                                )}
                                {item.open_in_new_tab && (
                                    <span className="text-[10px] text-gray-400">new tab</span>
                                )}
                            </div>
                            <div className="text-xs truncate">
                                {hidden ? (
                                    <span className="text-amber-600">
                                        Hidden on the site: the target is missing or unpublished.
                                    </span>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">{item.resolved_url}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {control("Move up", "up", <IconArrowUp size={14} />)}
                            {control("Move down", "down", <IconArrowDown size={14} />)}
                            {control("Make a child of the item above", "indent", <IconIndentIncrease size={14} />)}
                            {control("Move up one level", "outdent", <IconIndentDecrease size={14} />)}
                            {canEditMenus && (
                                <>
                                    <span title="Edit">
                                        <Button
                                            iconOnly
                                            size="xs"
                                            variant="secondary"
                                            rounded="lg"
                                            icon={<IconPencil size={14} />}
                                            disabled={saving}
                                            onClick={() => {
                                                setEditing(item);
                                                setFormMode("edit");
                                                setFormOpen(true);
                                            }}
                                        />
                                    </span>
                                    <span title="Delete">
                                        <Button
                                            iconOnly
                                            size="xs"
                                            variant="danger"
                                            rounded="lg"
                                            icon={<IconTrash size={14} />}
                                            disabled={saving}
                                            onClick={() => {
                                                setSelected(item);
                                                setConfirmOpen(true);
                                            }}
                                        />
                                    </span>
                                </>
                            )}
                        </div>
                    </li>
                    {item.children?.length > 0 && renderItems(item.children, depth + 1)}
                </React.Fragment>
            );
        });

    if (!Number.isFinite(menuId)) {
        return <EmptyState icon={<IconMoodEmpty size={48} />} message="Invalid menu." />;
    }
    if (loading && !menu) return <LinearProgress />;
    if (!menu) {
        return (
            <div className="flex flex-col gap-4">
                <EmptyState icon={<IconMoodEmpty size={48} />} message={error ?? "Menu not found."} />
                <div className="flex justify-center">
                    <Button
                        label="Back to menus"
                        variant="secondary"
                        rounded="lg"
                        onClick={() => navigate("/dashboard/cms/menus")}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            <PageTitle
                title={`Menu: ${menu.name}`}
                subtitle={menu.location ? `Location: ${menu.location}` : "No location set: this menu is not shown on the site yet."}
                actions={
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            label="Back"
                            onClick={() => navigate("/dashboard/cms/menus")}
                            variant="secondary"
                            icon={<IconArrowLeft size={16} className="text-gray-500" />}
                            iconPosition="left"
                            rounded="lg"
                        />
                        {canEditMenus && (
                            <Button
                                type="button"
                                label="Add item"
                                onClick={() => {
                                    setEditing(null);
                                    setFormMode("create");
                                    setFormOpen(true);
                                }}
                                variant="secondary"
                                icon={<IconPlus size={16} className="text-gray-500" />}
                                iconPosition="left"
                                rounded="lg"
                                disabled={saving}
                            />
                        )}
                    </div>
                }
            />

            <div style={{ flex: "1 1 auto", minHeight: 0 }} className="overflow-auto">
                {items.length === 0 ? (
                    <EmptyState icon={<IconMoodEmpty size={48} />} message="This menu has no items yet." />
                ) : (
                    <ul className={saving ? "opacity-60 pointer-events-none" : ""}>{renderItems(items)}</ul>
                )}
            </div>

            <MenuItemFormModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                mode={formMode}
                initialData={editing}
                items={items}
                categories={categories}
                posts={posts}
                onSubmit={handleFormSubmit}
            />

            <Modal
                showCloseButton={false}
                size="xsmall"
                isOpen={confirmOpen}
                onClose={closeDeleteModal}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                        Delete <strong>{selected?.label}</strong>?
                        {selected && selected.children?.length > 0 && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Its {selected.children.length} sub-item(s) will be deleted too.
                            </span>
                        )}
                    </div>
                }
                actions={
                    <div className="flex gap-4">
                        <Button
                            label={saving ? "Deleting..." : "Yes, Delete"}
                            variant="danger"
                            onClick={handleConfirmDelete}
                            className="min-w-[150px]"
                            rounded="lg"
                            disabled={saving}
                        />
                        <Button
                            label="Cancel"
                            variant="secondary"
                            onClick={closeDeleteModal}
                            className="min-w-[150px]"
                            rounded="lg"
                        />
                    </div>
                }
            />
        </div>
    );
};

export default CmsMenuBuilderPage;
