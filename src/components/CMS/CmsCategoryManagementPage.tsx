// src/components/CMS/CmsCategoryManagementPage.tsx
import React, { useMemo, useState } from "react";
import { IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { useCategory, type CategoryInput } from "../../hooks/useCategory";
import { useAlert } from "../../contexts/alertContext";
import type { CmsCategory } from "../../models/interfaces/Post";
import PageTitle from "../common/PageTitle";
import DataGrid from "../common/dataGrid/dataGrid";
import ActionButtons from "../common/dataGrid/actionButton";
import LinearProgress from "../common/LinearProgress";
import EmptyState from "../common/EmptyState";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { FormGroup, FormLabel, FormSelect } from "../common/Form";
import { IconMoodEmpty } from "@tabler/icons-react";
import CategoryFormModal from "./components/CategoryFormModal";
import { getApiErrorMessage } from "../../utils/apiError";
import { useCmsPermissions } from "../../hooks/useCmsPermissions";

const CmsCategoryManagementPage: React.FC = () => {
    const { categories, loading, actions } = useCategory();
    const { setAlert } = useAlert();
    const { canEditTaxonomy, canDeleteTaxonomy } = useCmsPermissions();

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<CmsCategory | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CmsCategory | null>(null);
    const [deleting, setDeleting] = useState(false);
    // "" = server default (children and posts move up to the parent)
    const [reassignTo, setReassignTo] = useState("");

    const closeDeleteModal = () => {
        setConfirmModalOpen(false);
        setSelectedCategory(null);
        setReassignTo("");
    };

    // The category itself and its descendants can't be a reassign target.
    const reassignOptions = useMemo(() => {
        if (!selectedCategory) return [];
        const excluded = new Set<number>([selectedCategory.id]);
        let grew = true;
        while (grew) {
            grew = false;
            for (const c of categories) {
                if (c.parent_id != null && excluded.has(c.parent_id) && !excluded.has(c.id)) {
                    excluded.add(c.id);
                    grew = true;
                }
            }
        }
        return categories.filter((c) => !excluded.has(c.id));
    }, [categories, selectedCategory]);

    const defaultTargetLabel = selectedCategory?.parent_id
        ? `Parent category (${categories.find((c) => c.id === selectedCategory.parent_id)?.name ?? "default"})`
        : "Top level / uncategorised (default)";

    const parentName = (parentId?: number | null) =>
        parentId ? categories.find((c) => c.id === parentId)?.name ?? "-" : "-";

    const handleCreateSubmit = async (data: CategoryInput) => {
        try {
            await actions.createCategory(data);
            setAlert({ type: "success", message: `Category "${data.name}" created.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: getApiErrorMessage(err, "Failed to create category."),
            });
            throw err;
        }
    };

    const handleEditSubmit = async (data: CategoryInput) => {
        if (!editing) return;
        try {
            // Partial update: send only what changed (an untouched slug can't collide with itself).
            const patch: Partial<CategoryInput> = {};
            if (data.name !== editing.name) patch.name = data.name;
            if (data.slug && data.slug !== editing.slug) patch.slug = data.slug;
            if ((data.description ?? null) !== (editing.description ?? null)) patch.description = data.description ?? null;
            if ((data.parent_id ?? null) !== (editing.parent_id ?? null)) patch.parent_id = data.parent_id ?? null;

            if (Object.keys(patch).length === 0) {
                setAlert({ type: "info", message: "No changes to save." });
                return;
            }
            await actions.updateCategory(editing.id, patch);
            setAlert({ type: "success", message: `Category "${data.name}" updated.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: getApiErrorMessage(err, "Failed to update category."),
            });
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;
        setDeleting(true);
        try {
            const result = await actions.deleteCategory(
                selectedCategory.id,
                reassignTo ? { reassign_to: Number(reassignTo) } : undefined
            );
            setAlert({
                type: "success",
                message: `Category "${selectedCategory.name}" deleted. Moved ${result.moved_children} sub-categories and ${result.moved_posts} posts.`,
            });
        } catch (err: any) {
            // 409 = a menu item still links to it, 400 = invalid reassign_to; detail says what to do.
            setAlert({
                type: "error",
                message: getApiErrorMessage(err, "Failed to delete category."),
            });
        } finally {
            setDeleting(false);
            closeDeleteModal();
        }
    };

    const columnDefs = useMemo(() => [
        { headerName: "ID", field: "id", width: 80, filter: false },
        { headerName: "Name", field: "name", flex: 1 },
        { headerName: "Slug", field: "slug", flex: 1, filter: false },
        {
            headerName: "Parent",
            field: "parent_id",
            flex: 1,
            filter: false,
            sortable: false,
            valueGetter: (p: any) => parentName(p.data.parent_id),
        },
        {
            headerName: "",
            field: "actions",
            width: 100,
            filter: false,
            sortable: false,
            resizable: false,
            pinned: "right",
            cellStyle: { textAlign: "center" },
            cellRenderer: ({ data }: any) => (
                <ActionButtons
                    row={data}
                    onEdit={canEditTaxonomy ? () => {
                        setEditing(data);
                        setFormMode("edit");
                        setFormOpen(true);
                    } : undefined}
                    onDelete={canDeleteTaxonomy ? () => {
                        setSelectedCategory(data);
                        setConfirmModalOpen(true);
                    } : undefined}
                />
            ),
        },
    ], [categories, canEditTaxonomy, canDeleteTaxonomy]);

    if (loading && categories.length === 0) {
        return <LinearProgress position="absolute" thickness="h-1" duration={3000} />;
    }

    return (
        <div className="">
            <PageTitle
                title="Category Management"
                actions={canEditTaxonomy ? (
                    <Button
                        type="button"
                        label="New Category"
                        onClick={() => {
                            setEditing(null);
                            setFormMode("create");
                            setFormOpen(true);
                        }}
                        variant="secondary"
                        icon={<IconPlus size={16} className="text-gray-500" />}
                        iconPosition="left"
                        rounded="lg"
                    />
                ) : undefined}
            />

            {categories.length === 0 ? (
                <EmptyState
                    icon={<IconMoodEmpty size={48} />}
                    message="No categories found."
                />
            ) : (
                <DataGrid
                    rowData={categories}
                    columnDefs={columnDefs}
                    pagination
                    paginationPageSize={10}
                    height="500px"
                />
            )}

            <CategoryFormModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                mode={formMode}
                initialData={editing}
                categories={categories}
                onSubmit={formMode === "edit" ? handleEditSubmit : handleCreateSubmit}
            />

            <Modal
                showCloseButton={false}
                size="small"
                isOpen={confirmModalOpen}
                onClose={closeDeleteModal}
                content={
                    <div className="text-sm px-10 pt-6 pb-8 space-y-4">
                        <div className="text-center">
                            <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                            Are you sure you want to delete category{" "}
                            <strong>{selectedCategory?.name}</strong>?
                        </div>
                        <FormGroup className="space-y-1">
                            <FormLabel htmlFor="reassign_to">Move its sub-categories and posts to</FormLabel>
                            <FormSelect
                                id="reassign_to"
                                name="reassign_to"
                                value={reassignTo}
                                onChange={(e) => setReassignTo(e.target.value)}
                            >
                                <option value="">{defaultTargetLabel}</option>
                                {reassignOptions.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </FormSelect>
                        </FormGroup>
                    </div>
                }
                actions={
                    <div className="flex gap-4">
                        <Button
                            label={deleting ? "Deleting..." : "Yes, Delete"}
                            variant="danger"
                            onClick={handleConfirmDelete}
                            className="min-w-[150px]"
                            rounded="lg"
                            disabled={deleting}
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

export default CmsCategoryManagementPage;