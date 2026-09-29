// src/components/HydroponicSystemPage/components/Plant/StageRecipeWizardModal.tsx
import { useState, useEffect, useMemo } from "react";
import WizardLayout from "../../../common/WizardLayout";
import { useTranslation } from "react-i18next";
import { useGrowthStages } from "../../../../hooks/useGrowthStages";
import { invalidatePlanStages } from "../../../../hooks/usePlanStages";
import { invalidatePlanDetail } from "../../../../hooks/useGrowthPlans";
import { useAlert } from "../../../../contexts/alertContext";
import { useHydroActuators } from "../../../../hooks/useHydroActuators";
import { stageSchema, recipeSchema } from "../../../../validation/growthStageValidation";
import { IconPlus, IconSettings, IconTrash } from "@tabler/icons-react";
import { getActuatorIcon } from "../../../../utils/actuator";
import { ACTUATOR_TYPES } from "../../../../constants/actuator";
import Modal from "../../../common/Modal";
import Button from "../../../common/Button";
import Form, { FormGroup, FormLabel, FormInput } from "../../../common/Form";
import { toApiTime, fromApiTime } from "../../../../utils/time";
import type { GrowthStage, GrowthStageCreate } from "../../../../models/interfaces/GrowthStage";
import type { GrowthRecipeCreate } from "../../../../models/interfaces/GrowthRecipe";
import RecipeForm from "./RecipeForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  plantId: number | null;
  planId: number | null;
  zoneId: number | null;
  onCreated?: (firstStageId?: number) => void;
};

type RecipeWithId = GrowthRecipeCreate & { id?: number };

type StageWithRecipes = Omit<GrowthStageCreate, "recipes"> & {
  id?: number;
  recipes: RecipeWithId[];
};

type StageErrors = {
  name?: string;
  day_start?: string;
  day_end?: string;
  recipes?: string;
};

const blankStage = (): StageWithRecipes => ({
  name: "",
  day_start: 0,
  day_end: 7,
  recipes: [],
});

// API → UI
const mapStage = (s: GrowthStage): StageWithRecipes => ({
  id: s.id,
  name: s.name,
  day_start: s.day_start,
  day_end: s.day_end,
  recipes: (s.recipes ?? []).map(
    (r): RecipeWithId => ({
      id: r.id,
      actuator_type: r.actuator_type,
      action: r.action,
      start_time: r.start_time ? fromApiTime(r.start_time) : undefined,
      end_time: r.end_time ? fromApiTime(r.end_time) : undefined,
      interval_on_min: r.interval_on_min,
      interval_off_min: r.interval_off_min,
    })
  ),
});

// UI → API
const toRecipePayload = (r: RecipeWithId) => ({
  actuator_type: r.actuator_type,
  action: r.action,
  start_time: r.start_time ? toApiTime(r.start_time) : undefined,
  end_time: r.end_time ? toApiTime(r.end_time) : undefined,
  interval_on_min: r.interval_on_min,
  interval_off_min: r.interval_off_min,
});

const StageRecipeWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  plantId,
  planId,
  zoneId,
  onCreated,
}) => {
  const { t } = useTranslation();
  const { actuators } = useHydroActuators(zoneId);
  const { setAlert } = useAlert();

  const { createStage, updateStageWithRecipes, deleteStage, fetchStagesByPlan } =
    useGrowthStages();

  const [step, setStep] = useState(0);
  const [stages, setStages] = useState<StageWithRecipes[]>([blankStage()]);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<StageErrors[]>([]);

  // ✅ ids of persisted stages the user removed → deleted on Finish
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [hadStages, setHadStages] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentStage = stages[activeStageIndex];

  // ------------------------
  // OPEN / PLAN CHANGE → reset, then load THIS plan's stages
  // ------------------------
  useEffect(() => {
    if (!isOpen) return;

    setStep(0);
    setActiveStageIndex(0);
    setFieldErrors([]);
    setRemovedIds([]);
    setHadStages(false);
    setStages([blankStage()]); // never show a previous plan's data

    if (!planId) return;

    let cancelled = false;
    setLoadingStages(true);

    fetchStagesByPlan(planId)
      .then((list) => {
        if (cancelled) return;
        if (list.length > 0) {
          setStages(list.map(mapStage));
          setHadStages(true);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setAlert({ message: "Failed to load stages", type: "error" });
      })
      .finally(() => {
        if (!cancelled) setLoadingStages(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, planId]);

  // ------------------------
  // DEFAULT RECIPE (new stages only)
  // ------------------------
  useEffect(() => {
    if (step !== 1) return;
    const stage = stages[activeStageIndex];
    if (!stage || stage.id || stage.recipes.length > 0) return;

    setStages((prev) =>
      prev.map((s, i) =>
        i === activeStageIndex
          ? {
              ...s,
              recipes: [
                {
                  actuator_type: "light",
                  action: "on",
                  start_time: "06:00",
                  end_time: "18:00",
                } as GrowthRecipeCreate,
              ],
            }
          : s
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, activeStageIndex]);

  // ------------------------
  // ACTUATOR BUTTONS (device actuators, or generic types when no device)
  // ------------------------
  const actuatorButtons = useMemo(() => {
    if (actuators.length > 0) {
      return actuators.map((a) => ({ key: String(a.id), label: a.name, type: a.type }));
    }
    return ACTUATOR_TYPES.map((a) => ({ key: a.value, label: a.label, type: a.value as string }));
  }, [actuators]);

  // ------------------------
  // VALIDATION (per step)
  // ------------------------
  const handleNext = async () => {
    const errors: StageErrors[] = [];

    try {
      if (step === 0) {
        await Promise.all(
          stages.map((s, index) =>
            stageSchema.validate(s, { abortEarly: false }).catch((err) => {
              err.inner.forEach((e: any) => {
                if (!errors[index]) errors[index] = {};
                errors[index][e.path as keyof StageErrors] = e.message;
              });
            })
          )
        );
      }

      if (step === 1) {
        const s = stages[activeStageIndex];
        if (!s) return;
        await recipeSchema.validate(s.recipes, { abortEarly: false }).catch((err) => {
          errors[activeStageIndex] = {
            ...errors[activeStageIndex],
            recipes: err.message,
          };
        });
      }

      if (step === 2) {
        await Promise.all(
          stages.map((s, index) =>
            recipeSchema.validate(s.recipes).catch((err) => {
              if (!errors[index]) errors[index] = {};
              errors[index].recipes = err.message;
            })
          )
        );
      }

      if (errors.some((e) => e && Object.keys(e).length > 0)) {
        setFieldErrors(errors);
        return;
      }

      setFieldErrors([]);
      setStep((s) => s + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------------
  // SAVE: validate all → delete removed → upsert
  // ------------------------
  const handleCreateAll = async () => {
    if (!plantId) {
      setAlert({ message: "Plant ID missing", type: "error" });
      return;
    }
    if (!planId) {
      setAlert({ message: "Growth plan is required", type: "error" });
      return;
    }

    // 1) validate EVERYTHING before touching the backend
    try {
      for (const s of stages) {
        await stageSchema.validate(s, { abortEarly: false });
        await recipeSchema.validate(s.recipes, { abortEarly: false });
      }
    } catch (err: any) {
      setAlert({ message: err?.message || "Please fix validation errors", type: "error" });
      return;
    }

    setSaving(true);
    try {
      // 2) delete stages the user removed
      for (const id of removedIds) {
        await deleteStage(id);
      }
      setRemovedIds([]);

      // 3) create / update
      let firstStageId: number | undefined;

      for (const s of stages) {
        let stageId: number;

        if (s.id) {
          await updateStageWithRecipes(s.id, {
            name: s.name,
            plan_id: planId,
            day_start: s.day_start,
            day_end: s.day_end,
            recipes: s.recipes.map(toRecipePayload),
          });
          stageId = s.id;
        } else {
          const newStage = await createStage({
            name: s.name,
            day_start: s.day_start,
            day_end: s.day_end,
            plant_id: plantId,
            plan_id: planId,
          });

          await updateStageWithRecipes(newStage.id, {
            name: newStage.name,
            day_start: newStage.day_start,
            day_end: newStage.day_end,
            plan_id: planId,
            recipes: s.recipes.map(toRecipePayload),
          });
          stageId = newStage.id;
        }

        if (!firstStageId) firstStageId = stageId;
      }

      // 4) refresh anything showing this plan's stages
      invalidatePlanStages();
      invalidatePlanDetail(planId);

      setAlert({ message: "✅ Saved!", type: "success" });
      onCreated?.(firstStageId);
      onClose();
    } catch (err: any) {
      console.error(err);
      setAlert({
        message: err?.response?.data?.detail || "❌ Failed",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // ------------------------
  // IMMUTABLE HELPERS
  // ------------------------
  const handleUpdateStage = (index: number, data: Partial<StageWithRecipes>) => {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, ...data } : s)));
  };

  const handleRemoveStage = (index: number) => {
    const target = stages[index];
    if (target?.id) {
      setRemovedIds((prev) => [...prev, target.id as number]);
    }
    setStages((prev) => prev.filter((_, i) => i !== index));
    setActiveStageIndex(Math.max(0, index - 1));
    setFieldErrors([]);
  };

  // ✅ prevent duplicate actuator type, with feedback
  const addRecipe = (recipe: GrowthRecipeCreate) => {
    const stage = stages[activeStageIndex];
    if (!stage) return;

    if (stage.recipes.some((r) => r.actuator_type === recipe.actuator_type)) {
      setAlert({
        message: `"${recipe.actuator_type}" is already in this stage`,
        type: "info",
      });
      return;
    }

    setStages((prev) =>
      prev.map((s, i) =>
        i === activeStageIndex ? { ...s, recipes: [...s.recipes, recipe] } : s
      )
    );
  };

  const handleUpdateRecipe = (stageIndex: number, recipeIndex: number, data: RecipeWithId) => {
    setStages((prev) =>
      prev.map((s, i) =>
        i === stageIndex
          ? { ...s, recipes: s.recipes.map((r, j) => (j === recipeIndex ? data : r)) }
          : s
      )
    );
  };

  const removeRecipe = (stageIndex: number, recipeIndex: number) => {
    setStages((prev) =>
      prev.map((s, i) =>
        i === stageIndex
          ? { ...s, recipes: s.recipes.filter((_, j) => j !== recipeIndex) }
          : s
      )
    );
  };

  const defaultRecipeFor = (type: string): GrowthRecipeCreate => {
    if (type === "light")
      return { actuator_type: type, action: "on", start_time: "06:00", end_time: "18:00" };
    if (type === "pump" || type === "water_pump")
      return { actuator_type: type, action: "interval", interval_on_min: 5, interval_off_min: 10 };
    if (type === "fan")
      return { actuator_type: type, action: "on", start_time: "08:00", end_time: "20:00" };
    return { actuator_type: type, action: "on" };
  };

  // ------------------------
  // STEPS
  // ------------------------
  const steps = [
    {
      title: "Stage Info",
      hideNav: true,
      component: (
        <Form onSubmit={(e) => e.preventDefault()} className="space-y-4 px-6">
          <Button
            label={t("btn.add_stage")}
            variant="secondary"
            size="xs"
            rounded="full"
            icon={<IconPlus size={16} className="text-gray-500" />}
            iconPosition="left"
            onClick={() => setStages((prev) => [...prev, blankStage()])}
          />

          {loadingStages && (
            <p className="text-xs text-gray-500">Đang tải giai đoạn...</p>
          )}

          {stages.map((stage, index) => (
            <div
              key={stage.id ?? `new-${index}`}
              className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
                  {t("hydro_system.stages.stage_title")} {index + 1}
                </span>
                <div className="flex items-center justify-between gap-2">
                  {stages.length > 1 && (
                    <Button
                      label="Remove"
                      size="xs"
                      variant="secondary"
                      rounded="full"
                      iconOnly
                      icon={<IconTrash size={16} />}
                      onClick={() => handleRemoveStage(index)}
                    />
                  )}

                  <Button
                    label={t("btn.growing_recipes")}
                    size="xs"
                    variant="secondary"
                    rounded="full"
                    icon={<IconSettings size={16} className="text-gray-500" />}
                    iconPosition="left"
                    onClick={() => {
                      setActiveStageIndex(index);
                      setStep(1);
                    }}
                  />
                </div>
              </div>

              <FormGroup className="space-y-1">
                <FormLabel htmlFor={`name_${index}`}>{t("input.stage_name.label")}</FormLabel>
                <FormInput
                  id={`name_${index}`}
                  type="text"
                  value={stage.name}
                  onChange={(e) => handleUpdateStage(index, { name: e.target.value })}
                />
                {fieldErrors[index]?.name && (
                  <p className="text-red-500 text-xs">{fieldErrors[index].name}</p>
                )}
              </FormGroup>

              <div className="flex gap-3 mb-4">
                <FormGroup className="space-y-1">
                  <FormLabel htmlFor={`day_start_${index}`}>{t("input.dayStart.label")}</FormLabel>
                  <FormInput
                    id={`day_start_${index}`}
                    type="number"
                    className="max-w-[100px]"
                    value={stage.day_start}
                    onChange={(e) =>
                      handleUpdateStage(index, { day_start: Number(e.target.value) })
                    }
                  />
                  {fieldErrors[index]?.day_start && (
                    <p className="text-red-500 text-xs">{fieldErrors[index].day_start}</p>
                  )}
                </FormGroup>

                <FormGroup className="space-y-1">
                  <FormLabel htmlFor={`day_end_${index}`}>{t("input.dayEnd.label")}</FormLabel>
                  <FormInput
                    id={`day_end_${index}`}
                    type="number"
                    className="max-w-[100px]"
                    value={stage.day_end}
                    onChange={(e) =>
                      handleUpdateStage(index, { day_end: Number(e.target.value) })
                    }
                  />
                  {fieldErrors[index]?.day_end && (
                    <p className="text-red-500 text-xs">{fieldErrors[index].day_end}</p>
                  )}
                </FormGroup>
              </div>
            </div>
          ))}
        </Form>
      ),
    },

    {
      title: "Recipes",
      hideNav: true,
      component: (
        <div className="space-y-4 px-6">
          {!currentStage ? (
            <div className="flex items-center justify-center p-8">
              <span className="text-gray-500">Loading stage...</span>
            </div>
          ) : (
            <>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
                Stage: {currentStage.name || `Stage ${activeStageIndex + 1}`}
              </span>

              <div className="grid grid-cols-7 md:grid-cols-3 gap-2 mb-4 mt-3">
                {actuatorButtons.map((a) => {
                  const { Icon, color } = getActuatorIcon(a.type);
                  const already = currentStage.recipes.some(
                    (r) => r.actuator_type === a.type
                  );

                  return (
                    <Button
                      key={a.key}
                      label={a.label}
                      iconPosition="left"
                      icon={<Icon size={16} className={color} />}
                      variant="secondary"
                      size="xs"
                      rounded="full"
                      className="w-30 h-10"
                      disabled={already}
                      onClick={() => addRecipe(defaultRecipeFor(a.type))}
                    />
                  );
                })}
              </div>

              {currentStage.recipes.map((r, i) => (
                <RecipeForm
                  key={`${activeStageIndex}-${r.actuator_type}-${i}`}
                  recipe={r}
                  onChange={(data) => handleUpdateRecipe(activeStageIndex, i, data)}
                  onRemove={() => removeRecipe(activeStageIndex, i)}
                />
              ))}

              {fieldErrors[activeStageIndex]?.recipes && (
                <p className="text-red-500 text-xs">{fieldErrors[activeStageIndex].recipes}</p>
              )}
            </>
          )}
        </div>
      ),
    },

    {
      title: "Review",
      hideNav: true,
      hideNext: true,
      component: (
        <div className="space-y-3 px-6">
          {stages.map((s, i) => (
            <div
              key={s.id ?? `new-${i}`}
              className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3"
            >
              <b>{s.name}</b>
              <div>
                Day {s.day_start} → {s.day_end}
              </div>
              <div className="text-sm mt-2">
                {s.recipes.map((r, j) => (
                  <div key={j}>
                    - {r.actuator_type} ({r.action})
                  </div>
                ))}
              </div>
            </div>
          ))}

          {removedIds.length > 0 && (
            <p className="text-xs text-red-500">
              {removedIds.length} stage(s) will be deleted when you finish.
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hadStages ? "Chỉnh sửa giai đoạn phát triển" : "Tạo giai đoạn phát triển cây mới"}
      size="small"
      content={
        <WizardLayout
          steps={steps}
          currentStep={step}
          goNext={handleNext}
          goBack={() => setStep((s) => s - 1)}
        />
      }
      actions={
        <div className="flex justify-between w-full">
          {step > 0 ? (
            <Button
              label={t("btn.previous")}
              variant="secondary"
              rounded="lg"
              className="min-w-[150px]"
              onClick={() => setStep((s) => s - 1)}
              disabled={saving}
            />
          ) : (
            <div />
          )}

          {step < steps.length - 1 ? (
            <Button
              label={t("btn.next")}
              rounded="lg"
              onClick={handleNext}
              className="min-w-[150px]"
              disabled={loadingStages}
            />
          ) : (
            <Button
              label={saving ? t("btn.saving") : t("btn.finish")}
              rounded="lg"
              className="min-w-[150px]"
              onClick={handleCreateAll}
              disabled={saving}
            />
          )}
        </div>
      }
    />
  );
};

export default StageRecipeWizardModal;