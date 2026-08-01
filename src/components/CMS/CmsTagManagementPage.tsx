// src/components/CMS/CmsTagManagementPage.tsx
import React, { useMemo, useState } from "react";
import { IconPlus, IconAlertCircle, IconMoodEmpty } from "@tabler/icons-react";
import { useTag, type TagInput } from "../../hooks/useTag";
import { useAlert } from "../../contexts/alertContext";
import type { CmsTag } from "../../models/interfaces/Post";
import PageTitle from "../common/PageTitle";
import DataGrid from "../common/dataGrid/dataGrid";
import LinearProgress from "../common/LinearProgress";
import EmptyState from "../common/EmptyState";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { IconTrash } from "@tabler/icons-react";
import TagFormModal from "./components/TagFormModal";

const CmsTagManagementPage: React.FC = () => {
    const { tags, loading, actions } = useTag();
    const { setAlert } = useAlert();

    const [formOpen, setFormOpen] = useState(false);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<CmsTag | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleCreateSubmit = async (data: TagInput) => {
        try {
            await actions.createTag(data);
            setAlert({ type: "success", message: `Tag "${data.name}" created.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to create tag.",
            });
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedTag) return;
        setDeleting(true);
        try {
            await actions.deleteTag(selectedTag.id);
            setAlert({ type: "success", message: `Tag "${selectedTag.name}" deleted.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to delete tag.",
            });
        } finally {
            setDeleting(false);
            setConfirmModalOpen(false);
            setSelectedTag(null);
        }
    };

    const columnDefs = useMemo(() => [
        { headerName: "ID", field: "id", width: 80, filter: false },
        { headerName: "Name", field: "name", flex: 1 },
        { headerName: "Slug", field: "slug", flex: 1, filter: false },
        {
            headerName: "",
            field: "actions",
            width: 80,
            filter: false,
            sortable: false,
            resizable: false,
            pinned: "right",
            cellStyle: { textAlign: "center" },
            cellRenderer: ({ data }: any) => (
                <div className="flex gap-2 items-center justify-center h-full">
                    <Button
                        icon={<IconTrash size={16} stroke={1.5} />}
                        iconOnly
                        variant="secondary"
                        onClick={() => {
                            setSelectedTag(data);
                            setConfirmModalOpen(true);
                        }}
                        label="Delete"
                        size="xs"
                        rounded="full"
                        className="bg-transparent"
                    />
                </div>
            ),
        },
    ], []);

    if (loading && tags.length === 0) {
        return <LinearProgress position="absolute" thickness="h-1" duration={3000} />;
    }

    return (
        <div className="">
            <PageTitle
                title="Tag Management"
                actions={
                    <Button
                        type="button"
                        label="New Tag"
                        onClick={() => setFormOpen(true)}
                        variant="secondary"
                        icon={<IconPlus size={16} className="text-gray-500" />}
                        iconPosition="left"
                        rounded="lg"
                    />
                }
            />

            {tags.length === 0 ? (
                <EmptyState
                    icon={<IconMoodEmpty size={48} />}
                    message="No tags found."
                />
            ) : (
                <DataGrid
                    rowData={tags}
                    columnDefs={columnDefs}
                    pagination
                    paginationPageSize={10}
                    height="500px"
                />
            )}

            <TagFormModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleCreateSubmit}
            />

            <Modal
                showCloseButton={false}
                size="xsmall"
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setSelectedTag(null);
                }}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                        Are you sure you want to delete tag{" "}
                        <strong>{selectedTag?.name}</strong>?
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

export default CmsTagManagementPage;