import { useState } from "react";
import { usePlants } from "../../../hooks/usePlants";
import { usePlantBatches } from "../../../hooks/usePlantBatches";
import { useGrowthStages } from "../../../hooks/useGrowthStages";

const PlantAutomationCard = () => {
  const { plants } = usePlants();
  const { batches, setStage } = usePlantBatches();
  const { stages, fetchStages, createStage, createRecipe } = useGrowthStages();

  const [plantId, setPlantId] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<any>(null);

  // -----------------------------
  // Select plant
  // -----------------------------
  const handleSelectPlant = async (id: number) => {
    setPlantId(id);
    await fetchStages(id);
  };

  // -----------------------------
  // Apply stage to batch 🔥
  // -----------------------------
  const handleApplyStage = async (stageId: number) => {
    if (!batches.length) return;

    const batch = batches.find(b => b.plant_id === plantId);

    if (batch) {
      await setStage(batch.id, stageId);
      alert("✅ Automation applied!");
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">

      {/* 🌱 Plant */}
      <div>
        <h3>🌱 Cây</h3>
        <select onChange={(e) => handleSelectPlant(Number(e.target.value))}>
          <option>Chọn cây</option>
          {plants.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* 🌿 Stages */}
      <div>
        <h3>🌿 Giai đoạn</h3>

        {stages.map(stage => (
          <div key={stage.id} className="border p-2 mb-2">
            <div>{stage.name}</div>
            <div>Day {stage.day_start} - {stage.day_end}</div>

            <button onClick={() => setSelectedStage(stage)}>
              ⚙️ Configure
            </button>

            <button onClick={() => handleApplyStage(stage.id)}>
              🚀 Apply
            </button>
          </div>
        ))}

        <button
          onClick={() =>
            createStage({
              plant_id: plantId!,
              name: "New Stage",
              day_start: 0,
              day_end: 7,
            })
          }
        >
          + Add Stage
        </button>
      </div>

      {/* ⚙️ Recipe */}
      <div>
        {selectedStage && (
          <>
            <h3>⚙️ Recipe - {selectedStage.name}</h3>

            <button
              onClick={() =>
                createRecipe({
                  stage_id: selectedStage.id,
                  actuator_type: "light",
                  action: "on",
                  start_time: "06:00:00",
                  end_time: "18:00:00",
                })
              }
            >
              💡 Add Light Schedule
            </button>

            <button
              onClick={() =>
                createRecipe({
                  stage_id: selectedStage.id,
                  actuator_type: "pump",
                  action: "interval",
                  interval_on_min: 5,
                  interval_off_min: 10,
                })
              }
            >
              💧 Add Pump Interval
            </button>
          </>
        )}
      </div>

    </div>
  );
};

export default PlantAutomationCard;