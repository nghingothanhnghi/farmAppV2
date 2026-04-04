// src/components/PlantBatch/components/BatchList.tsx

import { useMemo } from "react";
import type { PlantBatch } from "../../../models/interfaces/PlantBatch";
import { usePlantBatchContext } from "../../../contexts/plantBatchContext";
import DataGrid from "../../common/dataGrid/dataGrid";
import ActionButtons from "../../common/dataGrid/actionButton";

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
        return <div>Loading...</div>;
    }

    // ✅ Empty state
    if (!batches.length) {
        return <div>No batches found</div>;
    }

    return (
        <DataGrid
            rowData={batches}
            columnDefs={columns}
        />
    );
};

export default BatchList;