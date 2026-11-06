// src/components/CMS/CmsMenuManagementPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { IconPlus, IconAlertCircle, IconMoodEmpty, IconListTree } from "@tabler/icons-react";
import { useMenus } from "../../hooks/useMenu";
import { useAlert } from "../../contexts/alertContext";
import { useCmsPermissions } from "../../hooks/useCmsPermissions";
import type { CmsMenuSummary, MenuInput } from "../../models/interfaces/Menu";
import { getApiErrorMessage } from "../../utils/apiError";
import PageTitle from "../common/PageTitle";
import DataGrid from "../common/dataGrid/dataGrid";
import ActionButtons from "../common/dataGrid/actionButton";
import LinearProgress from "../common/LinearProgress";
import EmptyState from "../common/EmptyState";
import Modal from "../common/Modal";
import Button from "../common/Button";
import MenuFormModal from "./components/MenuFormModal";

const CmsMenuManagementPage: React.FC = () => {
    const { menus, loading, actions } = useMenus();
    const { setAlert } = useAlert();
    const { canEditMenus, canDeleteMenu } = useCmsPermissions();
    const navigate = useNavigate();

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<CmsMenuSummary | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<CmsMenuSummary | null>(null);
    const [deleting, setDeleting] = useState(false);

    const openBuilder = (menu: CmsMenuSummary) => navigate(`/dashboard/cms/menus/${menu.id}`);

    const handleFormSubmit = async (data: Partial<MenuInput>) => {
        // Errors propagate to the modal, which keeps itself open and shows them.
        if (formMode === "edit" && editing) {
            await actions.updateMenu(editing.id, data);
            setAlert({ type: "success", message: "Menu updated." });
        } else {
            const created = await actions.createMenu(data as MenuInput);
            setAlert({ type: "success", message: "Menu created. Add some items to it." });
            openBuilder(created);
        }
    };

    const closeDeleteModal = () => {
        setConfirmOpen(false);
        setSelected(null);
    };

    const handleConfirmDelete = async () => {
        if (!selected) return;
        setDeleting(true);
        try {
            await actions.deleteMenu(selected.id);
            setAlert({ type: "success", message: `Menu "${selected.name}" deleted.` });
        } catch (err: any) {
            setAlert({ type: "error", message: getApiErrorMessage(err, "Failed to delete menu.") });
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
            headerName: "Location",
            field: "location",
            flex: 1,
            valueFormatter: ({ value }: any) => value || "—",
        },
        {
            headerName: "",
            field: "actions",
            width: 150,
            filter: false,
            sortable: false,
            resizable: false,
            pinned: "right",
            cellStyle: { textAlign: "center" },
            cellRenderer: ({ data }: any) => (
                <div className="flex gap-2 items-center justify-center h-full">
                    <span title="Manage items">
                        <Button
                            icon={<IconListTree size={16} stroke={1.5} />}
                            iconOnly
                            variant="secondary"
                            rounded="lg"
                            size="xs"
                            onClick={() => openBuilder(data)}
                        />
                    </span>
                    <ActionButtons
                        row={data}
                        onEdit={canEditMenus ? () => {
                            setEditing(data);
                            setFormMode("edit");
                            setFormOpen(true);
                        } : undefined}
                        onDelete={canDeleteMenu ? () => {
                            setSelected(data);
                            setConfirmOpen(true);
                        } : undefined}
                    />
                </div>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [canEditMenus, canDeleteMenu]);

    if (loading && menus.length === 0) return <LinearProgress />;

    return (
        <div className="flex flex-col h-full min-h-0">
            <PageTitle
                title="Menu Management"
                actions={canEditMenus ? (
                    <Button
                        type="button"
                        label="New Menu"
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
            <div style={{ flex: "1 1 auto", minHeight: 0 }}>
                {menus.length === 0 ? (
                    <EmptyState icon={<IconMoodEmpty size={48} />} message="No menus found." />
                ) : (
                    <DataGrid
                        rowData={menus}
                        columnDefs={columnDefs}
                        pagination
                        paginationPageSize={10}
                        height="auto"
                    />
                )}
            </div>

            <MenuFormModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                mode={formMode}
                initialData={editing}
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
                        Are you sure you want to delete menu <strong>{selected?.name}</strong>?
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-2">
                            All of its items will be deleted too.
                        </span>
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

export default CmsMenuManagementPage;
