// src/components/CMS/CmsTagManagementPage.tsx
import React, { useMemo, useState } from "react";
import { IconPlus, IconAlertCircle, IconMoodEmpty } from "@tabler/icons-react";
import { useTag, type TagInput } from "../../hooks/useTag";
import { useAlert } from "../../contexts/alertContext";
import type { CmsTag, CmsTagUpdate } from "../../models/interfaces/Post";
import PageTitle from "../common/PageTitle";
import DataGrid from "../common/dataGrid/dataGrid";
import LinearProgress from "../common/LinearProgress";
import EmptyState from "../common/EmptyState";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { FormGroup, FormLabel, FormSelect } from "../common/Form";
import type { TagDeleteOptions } from "../../services/tagService";
import ActionButtons from "./../common/dataGrid/actionButton";
import TagFormModal from "./components/TagFormModal";
import { getApiErrorMessage } from "../../utils/apiError";
import { useCmsPermissions } from "../../hooks/useCmsPermissions";

const CmsTagManagementPage: React.FC = () => {
    const { tags, loading, actions } = useTag();
    const { setAlert } = useAlert();
    const { canEditTaxonomy, canDeleteTaxonomy } = useCmsPermissions();

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<CmsTag | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<CmsTag | null>(null);
    const [deleting, setDeleting] = useState(false);
    // Set when the server answers 409 (tag is in use) so the dialog can offer merge / force.
    const [inUseMessage, setInUseMessage] = useState<string | null>(null);
    const [mergeInto, setMergeInto] = useState("");

    const closeDeleteModal = () => {
        setConfirmModalOpen(false);
        setSelectedTag(null);
        setInUseMessage(null);
        setMergeInto("");
    };

    const handleCreateSubmit = async (data: TagInput) => {
        try {
            await actions.createTag(data);
            setAlert({ type: "success", message: `Tag "${data.name}" created.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: getApiErrorMessage(err, "Failed to create tag."),
            });
            throw err;
        }
    };

    const handleEditSubmit = async (data: TagInput) => {
        if (!editing) return;
        // Partial update: send only what changed (an untouched slug can't collide with itself).
        const patch: CmsTagUpdate = {};
        if (data.name !== editing.name) patch.name = data.name;
        if (data.slug && data.slug !== editing.slug) patch.slug = data.slug;
        if (Object.keys(patch).length === 0) {
            setAlert({ type: "info", message: "No changes to save." });
            return;
        }
        try {
            await actions.updateTag(editing.id, patch);
            setAlert({ type: "success", message: `Tag "${data.name}" updated.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                // 409 = another tag already uses that name or slug
                message: getApiErrorMessage(err, "Failed to update tag."),
            });
            throw err;
        }
    };

    const handleConfirmDelete = async (options?: TagDeleteOptions) => {
        if (!selectedTag) return;
        setDeleting(true);
        try {
            const result = await actions.deleteTag(selectedTag.id, options);
            const target = tags.find((t) => t.id === result.merged_into_tag_id);
            const message = result.merged_into_tag_id != null
                ? `Tag "${selectedTag.name}" merged into "${target?.name ?? result.merged_into_tag_id}" (${result.posts_moved} posts updated).`
                : options?.force
                    ? `Tag "${selectedTag.name}" deleted and removed from ${result.posts_affected} posts.`
                    : `Tag "${selectedTag.name}" deleted.`;
            setAlert({ type: "success", message });
            closeDeleteModal();
        } catch (err: any) {
            if (err?.response?.status === 409 && !options) {
                // In use: keep the dialog open and let the user choose what to do.
                setInUseMessage(getApiErrorMessage(err, "This tag is used by posts."));
            } else {
                setAlert({
                    type: "error",
                    message: getApiErrorMessage(err, "Failed to delete tag."),
                });
                closeDeleteModal();
            }
        } finally {
            setDeleting(false);
        }
    };

    const columnDefs = useMemo(() => [
        { headerName: "ID", field: "id", width: 80, filter: false },
        { headerName: "Name", field: "name", flex: 1 },
        { headerName: "Slug", field: "slug", flex: 1, filter: false },
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
                        setSelectedTag(data);
                        setConfirmModalOpen(true);
                    } : undefined}
                />
            ),
        },
    ], [canEditTaxonomy, canDeleteTaxonomy]);

    if (loading && tags.length === 0) {
        return <LinearProgress position="absolute" thickness="h-1" duration={3000} />;
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            <PageTitle
                title="Tag Management"
                actions={canEditTaxonomy ? (
                    <Button
                        type="button"
                        label="New Tag"
                        onClick={() => { setEditing(null); setFormMode("create"); setFormOpen(true); }}
                        variant="secondary"
                        icon={<IconPlus size={16} className="text-gray-500" />}
                        iconPosition="left"
                        rounded="lg"
                    />
                ) : undefined}
            />
            <div style={{ flex: '1 1 auto', minHeight: 0 }}>
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
                        height="auto"
                    />
                )}
            </div>
            <TagFormModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                mode={formMode}
                initialData={editing}
                onSubmit={formMode === "edit" ? handleEditSubmit : handleCreateSubmit}
            />

            <Modal
                showCloseButton={false}
                size={inUseMessage ? "small" : "xsmall"}
                isOpen={confirmModalOpen}
                onClose={closeDeleteModal}
                content={
                    inUseMessage ? (
                        <div className="text-sm px-10 pt-6 pb-8 space-y-4">
                            <IconAlertCircle size={64} className="text-amber-500 mb-2 mx-auto" />
                            <p className="text-center">
                                <strong>{selectedTag?.name}</strong> is still used by posts.
                                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{inUseMessage}</span>
                            </p>
                            <FormGroup className="space-y-1">
                                <FormLabel htmlFor="merge_into">Merge into another tag</FormLabel>
                                <FormSelect
                                    id="merge_into"
                                    name="merge_into"
                                    value={mergeInto}
                                    onChange={(e) => setMergeInto(e.target.value)}
                                >
                                    <option value="">Select a tag…</option>
                                    {tags
                                        .filter((t) => t.id !== selectedTag?.id)
                                        .map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                </FormSelect>
                            </FormGroup>
                        </div>
                    ) : (
                        <div className="text-sm px-10 pt-6 pb-10 text-center">
                            <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                            Are you sure you want to delete tag{" "}
                            <strong>{selectedTag?.name}</strong>?
                        </div>
                    )
                }
                actions={
                    inUseMessage ? (
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button
                                label={deleting ? "Working..." : "Merge & delete"}
                                variant="primary"
                                onClick={() => handleConfirmDelete({ merge_into: Number(mergeInto) })}
                                rounded="lg"
                                disabled={deleting || !mergeInto}
                            />
                            <Button
                                label="Remove from all posts & delete"
                                variant="danger"
                                onClick={() => handleConfirmDelete({ force: true })}
                                rounded="lg"
                                disabled={deleting}
                            />
                            <Button
                                label="Cancel"
                                variant="secondary"
                                onClick={closeDeleteModal}
                                rounded="lg"
                                disabled={deleting}
                            />
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Button
                                label={deleting ? "Deleting..." : "Yes, Delete"}
                                variant="danger"
                                onClick={() => handleConfirmDelete()}
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
                    )
                }
            />
        </div>
    );
};

export default CmsTagManagementPage;