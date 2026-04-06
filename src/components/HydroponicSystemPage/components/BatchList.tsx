// src/components/PlantBatch/components/BatchList.tsx

import { useMemo } from "react";
import { IconMoodEmpty } from '@tabler/icons-react';
import type { PlantBatch } from "../../../models/interfaces/PlantBatch";
import { usePlantBatchContext } from "../../../contexts/plantBatchContext";
import DataGrid from "../../common/dataGrid/dataGrid";
import ActionButtons from "../../common/dataGrid/actionButton";
import LinearProgress from '../../common/LinearProgress';
import EmptyState from '../../common/EmptyState';

type Props = {
    onSelect?: (batch: PlantBatch) => void;
};

const BatchList: React.FC<Props> = ({ onSelect }) => {
    const { batches, loading } = usePlantBatchContext();

    const columns = useMemo(() => {
        return [
            { headerName: 'ID', field: 'id', width: 80 },
            { headerName: 'Plant', field: 'plant_id', flex: 1 },
            { headerName: 'Zone', field: 'zone_id', flex: 1 },
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