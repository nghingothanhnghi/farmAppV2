// src/components/PlantBatch/components/BatchList.tsx

import { useMemo } from "react";
import { IconMoodEmpty } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { PlantBatch } from "../../../models/interfaces/PlantBatch";
import { usePlantBatchContext } from "../../../contexts/plantBatchContext";
import { getStageColor } from "../../../utils/stage";
import DataGrid from "../../common/dataGrid/dataGrid";
import ActionButtons from "../../common/dataGrid/actionButton";
import LinearProgress from '../../common/LinearProgress';
import EmptyState from '../../common/EmptyState';

type Props = {
    onSelect?: (batch: PlantBatch) => void;
};

const BatchList: React.FC<Props> = ({ onSelect }) => {
    const { t } = useTranslation();
    const { batches, loading, deleteBatch } = usePlantBatchContext();

    const columns = useMemo(() => {
        return [
            { headerName: 'ID', field: 'id', width: 80 },
            { 
                headerName: 'Plant', 
                field: 'plant_name', 
                valueGetter: (p: any) => 
                    p.data.plant_name || t('dataGrid.fallback.unknown_plant'), 
                flex: 1 
            },
            {
                headerName: 'Zone',
                field: 'zone_id',
                flex: 1,
                cellRenderer: ({ data }: { data: PlantBatch }) => (
                    <div className="text-sm">
                        <div className="font-medium">
                            {data.device_name || t('dataGrid.fallback.unknown_device')}
                        </div>
                        <div className="text-xs text-gray-500">
                             {data.device_location || t('dataGrid.fallback.no_location')}
                        </div>
                    </div>
                )
            },
            {
                headerName: 'Stage',
                field: 'current_stage_name',
                flex: 1,
                cellRenderer: ({ data }: { data: PlantBatch }) => (
                    <span
                        className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getStageColor(
                            data.current_stage_name
                        )}`}
                    >
                        {data.current_stage_name || "No stage"}
                    </span>
                )
            },

            {
                headerName: 'Progress',
                field: 'days_growing',
                flex: 1.5,
                cellRenderer: ({ data }: { data: PlantBatch }) => {
                    const totalDays = 30; // 👉 you can make dynamic later
                    const percent = Math.min(
                        ((data.days_growing || 0) / totalDays) * 100,
                        100
                    );

                    return (
                        <div className="w-full">
                            <div className="text-xs mb-1">
                                {data.days_growing || 0} days
                            </div>

                            <LinearProgress
                                value={percent}
                                thickness="h-2"
                                message={`${Math.round(percent)}%`}
                            />
                        </div>
                    );
                }
            },
            { headerName: 'Start Date', field: 'start_date', flex: 1 },
            { headerName: 'Status', field: 'status', flex: 1 },

            onSelect && {
                headerName: '',
                field: 'actions',
                cellRenderer: ({ data }: { data: PlantBatch }) => (
                    <ActionButtons
                        row={data}
                        onEdit={() => onSelect?.(data)}
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
        <DataGrid
            rowData={batches}
            columnDefs={columns}
        />
    );
};

export default BatchList;