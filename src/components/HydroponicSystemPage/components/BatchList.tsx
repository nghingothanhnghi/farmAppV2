// src/components/PlantBatch/components/BatchList.tsx

import { useMemo, useState } from "react";
import { IconMoodEmpty } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { PlantBatch } from "../../../models/interfaces/PlantBatch";
import { usePlantBatchContext } from "../../../contexts/plantBatchContext";
import DataGrid from "../../common/dataGrid/dataGrid";
import ActionButtons from "../../common/dataGrid/actionButton";
import LinearProgress from '../../common/LinearProgress';
import EmptyState from '../../common/EmptyState';
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { IconAlertCircle } from "@tabler/icons-react";
import { useAlert } from "../../../contexts/alertContext";
import BatchTimelineCell from "./BatchTimelineCell";

type Props = {
    onSelect?: (batch: PlantBatch) => void;
};

const BatchList: React.FC<Props> = ({ onSelect }) => {
    const { t } = useTranslation();
    const { batches, loading, deleteBatch } = usePlantBatchContext();

    const { setAlert } = useAlert();

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<PlantBatch | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        if (!selectedBatch) return;

        try {
            setDeleting(true);
            await deleteBatch(selectedBatch.id);

            setAlert({
                type: "success",
                message: `Batch #${selectedBatch.id} deleted successfully`,
            });

        } catch (err) {
            console.error(err);
            setAlert({
                type: "error",
                message: "Failed to delete batch",
            });
        }
        setDeleting(false);
        setConfirmModalOpen(false);
        setSelectedBatch(null);
    };

    const columns = useMemo(() => {
        return [
            { headerName: 'ID', field: 'id', width: 80 },
            {
                headerName: 'Cây trồng',
                field: 'plant_name',
                valueGetter: (p: any) =>
                    p.data.plant_name || t('dataGrid.fallback.unknown_plant'),
                flex: 1
            },
            {
                headerName: 'Khu vực',
                field: 'zone_id',
                flex: 1,
                align: "left",
                cellRenderer: ({ data }: { data: PlantBatch }) => (
                    <div className="">
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                            {data.device_name || t('dataGrid.fallback.unknown_device')}
                        </div>
                        <div className="text-xs text-[10px] text-gray-600 dark:text-gray-400">
                            {data.device_location || t('dataGrid.fallback.no_location')}
                        </div>
                    </div>
                )
            },
            {
                headerName: 'Gia đoạn sinh trưởng',
                field: 'days_growing',
                flex: 1.5,
                filter: false,
                sortable: false,
                cellRenderer: ({ data }: { data: PlantBatch }) => (
                    <BatchTimelineCell batch={data} />
                )
            },
            { headerName: 'Ngày bắt đầu', field: 'start_date', flex: 1 },
            { headerName: 'Trạng thái', field: 'status', flex: 1 },

            onSelect && {
                headerName: '',
                field: 'actions',
                width: 100,
                filter: false,
                sortable: false,
                resizable: false,
                pinned: "right",
                cellStyle: { textAlign: "center" },
                cellRenderer: ({ data }: { data: PlantBatch }) => (
                    <ActionButtons
                        row={data}
                        onEdit={() => onSelect?.(data)}
                        onDelete={(row) => {
                            setSelectedBatch(row);
                            setConfirmModalOpen(true);
                        }}
                    />
                ),
            },
        ].filter(Boolean);
    }, [onSelect]);

    // ✅ Loading state
    if (loading) {
        return <LinearProgress />;
    }

    // ✅ Empty state
    if (!batches.length) {
        return <EmptyState
            icon={<IconMoodEmpty size={48} />}
            message="No Plant Batches found."
        />;
    }

    return (
        <>
            <DataGrid
                rowData={batches}
                columnDefs={columns}
            />

            <Modal
                showCloseButton={false}
                size="xsmall"
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setSelectedBatch(null);
                }}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                        Are you sure you want to delete batch{" "}
                        <strong>#{selectedBatch?.id}</strong>?
                    </div>
                }
                actions={
                    <div className="flex gap-4">
                        <Button
                            label={deleting ? "Deleting..." : "Delete"}
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
        </>

    );
};

export default BatchList;