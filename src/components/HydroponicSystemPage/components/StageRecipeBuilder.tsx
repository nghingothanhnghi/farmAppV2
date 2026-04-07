import { useState } from "react";
import Button from "../../common/Button";
import DropdownButton from "../../common/DropdownButton";
import { usePlants } from "../../../hooks/usePlants";
import { usePlantBatches } from "../../../hooks/usePlantBatches";
import { useGrowthStages } from "../../../hooks/useGrowthStages";

const StageRecipeBuilder = () => {
  const { plants } = usePlants();
  const { batches, setStage } = usePlantBatches();
  const { stages, fetchStages, createStage, createRecipe } = useGrowthStages();

  const [plantId, setPlantId] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Select plant
  // -----------------------------
  const handleSelectPlant = async (id: number) => {
    setPlantId(id);
    setSelectedStage(null);
    await fetchStages(id);
  };

    // -----------------------------
  // Apply stage to ALL batches 🔥
  // -----------------------------
  const handleApplyStage = async (stageId: number) => {
    if (!plantId) return;

    const plantBatches = batches.filter(b => b.plant_id === plantId);

    if (!plantBatches.length) {
      alert("❌ No batch found for this plant");
      return;
    }

    try {
      setLoading(true);

      await Promise.all(
        plantBatches.map(batch =>
          setStage(batch.id, stageId)
        )
      );

      alert(`✅ Applied to ${plantBatches.length} batches`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to apply stage");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="grid grid-cols-3 gap-6">

      {/* 🌱 Plant */}
      <div>
        <h3 className="font-semibold mb-2">🌱 Cây</h3>

        <select
          className="w-full border p-2 rounded"
          onChange={(e) => handleSelectPlant(Number(e.target.value))}
        >
          <option value="">Chọn cây</option>
          {plants.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🌿 Stages */}
      <div>
        <h3 className="font-semibold mb-2">🌿 Giai đoạn</h3>

        {stages.map(stage => (
          <div
            key={stage.id}
            className={`border p-3 mb-2 rounded ${
              selectedStage?.id === stage.id
                ? "border-blue-500 bg-blue-50"
                : ""
            }`}
          >
            <div className="font-medium">{stage.name}</div>
            <div className="text-sm text-gray-500">
              Day {stage.day_start} - {stage.day_end}
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                label="⚙️ Configure"
                onClick={() => setSelectedStage(stage)}
              />

              <Button
                label={loading ? "Applying..." : "🚀 Apply"}
                onClick={() => handleApplyStage(stage.id)}
                disabled={loading || !plantId}
              />
            </div>
          </div>
        ))}

        <Button
          label="+ Add Stage"
          onClick={() =>
            plantId &&
            createStage({
              plant_id: plantId,
              name: "New Stage",
              day_start: 0,
              day_end: 7,
            })
          }
          disabled={!plantId}
        />
      </div>

      {/* ⚙️ Recipe */}
      <div>
        {selectedStage ? (
          <>
            <h3 className="font-semibold mb-2">
              ⚙️ Recipe - {selectedStage.name}
            </h3>

            <div className="flex flex-col gap-2">

              <Button
                label="💡 Add Light Schedule"
                onClick={() =>
                  createRecipe({
                    stage_id: selectedStage.id,
                    actuator_type: "light",
                    action: "on",
                    start_time: "06:00:00",
                    end_time: "18:00:00",
                  })
                }
              />

              <Button
                label="💧 Add Pump Interval"
                onClick={() =>
                  createRecipe({
                    stage_id: selectedStage.id,
                    actuator_type: "pump",
                    action: "interval",
                    interval_on_min: 5,
                    interval_off_min: 10,
                  })
                }
              />

            </div>
          </>
        ) : (
          <p className="text-gray-400">
            👉 Chọn stage để cấu hình recipe
          </p>
        )}
      </div>

    </div>
  );
};

export default StageRecipeBuilder;