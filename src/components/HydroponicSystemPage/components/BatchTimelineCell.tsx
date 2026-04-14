// src/components/PlantBatch/components/BatchTimelineCell.tsx

import { useEffect } from "react";
import { useGrowthStages } from "../../../hooks/useGrowthStages";
import StageTimeline from "../../../components/common/StageTimeline";
import type { PlantBatch } from "../../../models/interfaces/PlantBatch";

type Props = {
    batch: PlantBatch;
};

const BatchTimelineCell: React.FC<Props> = ({ batch }) => {
    const { stages, fetchStages } = useGrowthStages();

    useEffect(() => {
        if (batch.plant_id) {
            fetchStages(batch.plant_id);
        }
    }, [batch.plant_id]);

    if (!stages.length) {
        return <div className="text-xs text-gray-400">No stages</div>;
    }

    return (
        <StageTimeline
            stages={stages}
            daysGrowing={batch.days_growing || 0}
        />
    );
};

export default BatchTimelineCell;