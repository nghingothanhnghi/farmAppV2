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
import { IconMoodEmpty } from "@tabler/icons-react";
import CategoryFormModal from "./components/CategoryFormModal";

const CmsCategoryManagementPage: React.FC = () => {
    const { categories, loading, actions } = useCategory();
    const { setAlert } = useAlert();

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<CmsCategory | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CmsCategory | null>(null);
    const [deleting, setDeleting] = useState(false);

    const parentName = (parentId?: number | null) =>
        parentId ? categories.find((c) => c.id === parentId)?.name ?? "-" : "-";

    const handleCreateSubmit = async (data: CategoryInput) => {
        try {
            await actions.createCategory(data);
            setAlert({ type: "success", message: `Category "${data.name}" created.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to create category.",
            });
            throw err;
        }
    };

    const handleEditSubmit = async (data: CategoryInput) => {
        if (!editing) return;
        try {
            await actions.updateCategory(editing.id, data);
            setAlert({ type: "success", message: `Category "${data.name}" updated.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to update category.",
            });
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;
        setDeleting(true);
        try {
            await actions.deleteCategory(selectedCategory.id);
            setAlert({ type: "success", message: `Category "${selectedCategory.name}" deleted.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to delete category.",
            });
        } finally {
            setDeleting(false);
            setConfirmModalOpen(false);
            setSelectedCategory(null);
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
                    onEdit={() => {
                        setEditing(data);
                        setFormMode("edit");
                        setFormOpen(true);
                    }}
                    onDelete={() => {
                        setSelectedCategory(data);
                        setConfirmModalOpen(true);
                    }}
                />
            ),
        },
    ], [categories]);

    if (loading && categories.length === 0) {
        return <LinearProgress position="absolute" thickness="h-1" duration={3000} />;
    }

    return (
        <div className="">
            <PageTitle
                title="Category Management"
                actions={
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
                }
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
                size="xsmall"
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setSelectedCategory(null);
                }}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                        Are you sure you want to delete category{" "}
                        <strong>{selectedCategory?.name}</strong>?
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
                            onClick={() => setConfirmModalOpen(false)}
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