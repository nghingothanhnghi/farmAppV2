import { useState, useEffect } from "react";
import WizardLayout from "../../common/WizardLayout";
import { useGrowthStages } from "../../../hooks/useGrowthStages";
import { useAlert } from "../../../contexts/alertContext";
import { useHydroActuators } from "../../../hooks/useHydroActuators";
import { stageSchema, recipeSchema } from "../../../validation/growthStageValidation";
import { IconPlus, IconSettings, IconTrash } from '@tabler/icons-react';
import { getActuatorIcon } from "../../../utils/actuator";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import Form, {
  FormGroup,
  FormLabel,
  FormInput,
} from "../../common/Form";
import { toApiTime, fromApiTime } from '../../../utils/time';
import type { GrowthStageCreate } from "../../../models/interfaces/GrowthStage";
import type { GrowthRecipeCreate } from "../../../models/interfaces/GrowthRecipe";
import RecipeForm from "./RecipeForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  plantId: number | null;
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

const StageRecipeWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  plantId,
  zoneId,
  onCreated
}) => {

  const { actuators } = useHydroActuators(zoneId);
  const { setAlert } = useAlert();

  const {
    createStage,
    updateStageWithRecipes,
    fetchStages,
    stages: fetchedStages
  } = useGrowthStages();

  const [step, setStep] = useState(0);

  const [stages, setStages] = useState<StageWithRecipes[]>([
    {
      name: "",
      day_start: 0,
      day_end: 7,
      recipes: [],
    },
  ]);

  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<StageErrors[]>([]);

  const currentStage = stages[activeStageIndex];

  // ------------------------
  // RESET
  // ------------------------
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setActiveStageIndex(0);
      setStages([{ name: "", day_start: 0, day_end: 7, recipes: [] }]);
    }
  }, [isOpen]);

  // ------------------------
  // FETCH
  // ------------------------
  useEffect(() => {
    if (isOpen && plantId) {
      fetchStages(plantId);
    }
  }, [isOpen, plantId]);

  // ------------------------
  // MAP API → UI (FIXED)
  // ------------------------
  useEffect(() => {
    if (fetchedStages.length > 0) {

      const mapped: StageWithRecipes[] = fetchedStages.map(s => ({
        id: s.id,
        name: s.name,
        day_start: s.day_start,
        day_end: s.day_end,
        recipes: (s.recipes ?? []).map((r): RecipeWithId => ({
          id: r.id,
          actuator_type: r.actuator_type,
          action: r.action,
          // start_time: r.start_time,
          // end_time: r.end_time,

          // ✅ use util (NO slice anymore)
          start_time: r.start_time ? fromApiTime(r.start_time) : undefined,
          end_time: r.end_time ? fromApiTime(r.end_time) : undefined,

          interval_on_min: r.interval_on_min,
          interval_off_min: r.interval_off_min,
        })),
      }));

      setStages(mapped);
      if (activeStageIndex >= mapped.length) {
        setActiveStageIndex(Math.max(0, mapped.length - 1));
      }
    }
  }, [fetchedStages]);

  // ------------------------
  // DEFAULT RECIPE
  // ------------------------
  useEffect(() => {
    if (step === 1) {
      const stage = stages[activeStageIndex];

      if (
        stage &&
        stage.recipes.length === 0 &&
        fetchedStages.length === 0
      ) {
        setStages(prev => {
          const copy = [...prev];

          copy[activeStageIndex] = {
            ...copy[activeStageIndex],
            recipes: [
              {
                actuator_type: "light",
                action: "on",
                start_time: "06:00",
                end_time: "18:00",
              } as GrowthRecipeCreate,
            ],
          };

          return copy;
        });
      }
    }
  }, [step, activeStageIndex, fetchedStages]);



  // ------------------------
  // VALIDATION
  // ------------------------
  const handleNext = async () => {
    const errors: StageErrors[] = [];

    try {
      if (step === 0) {
        await Promise.all(
          stages.map((s, index) =>
            stageSchema.validate(s, { abortEarly: false }).catch(err => {
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

        await recipeSchema
          .validate(s.recipes, { abortEarly: false })
          .catch(err => {
            errors[activeStageIndex] = {
              ...errors[activeStageIndex],
              recipes: err.message,
            };
          });
      }

      if (step === 2) {
        await Promise.all(
          stages.map((s, index) =>
            recipeSchema.validate(s.recipes).catch(err => {
              if (!errors[index]) errors[index] = {};
              errors[index].recipes = err.message;
            })
          )
        );
      }

      const hasError = errors.some(e => e && Object.keys(e).length > 0);
      if (hasError) {
        setFieldErrors(errors);
        return;
      }

      setFieldErrors([]);
      setStep(s => s + 1);

    } catch (err) {
      console.error(err);
    }
  };

  // ------------------------
  // CREATE ALL
  // ------------------------
  const handleCreateAll = async () => {
    if (!plantId) {
      setAlert({ message: "Plant ID missing", type: "error" });
      return;
    }

    try {
      let firstStageId: number | undefined;

      for (const s of stages) {
        await stageSchema.validate(s, { abortEarly: false });
        await recipeSchema.validate(s.recipes, { abortEarly: false });

        let stageId: number;

        if (s.id) {
          // UPDATE
          await updateStageWithRecipes(s.id, {
            name: s.name,
            day_start: s.day_start,
            day_end: s.day_end,
            recipes: s.recipes.map(r => ({
              actuator_type: r.actuator_type,
              action: r.action,
              // start_time: r.start_time,
              // end_time: r.end_time,

              // ✅ normalize before sending
              start_time: r.start_time ? toApiTime(r.start_time) : undefined,
              end_time: r.end_time ? toApiTime(r.end_time) : undefined,

              interval_on_min: r.interval_on_min,
              interval_off_min: r.interval_off_min,
            })),
          });

          stageId = s.id;

        } else {
          // CREATE
          const newStage = await createStage({
            name: s.name,
            day_start: s.day_start,
            day_end: s.day_end,
            plant_id: plantId,
          });

          await updateStageWithRecipes(newStage.id, {
            name: newStage.name,
            day_start: newStage.day_start,
            day_end: newStage.day_end,
            recipes: s.recipes.map(r => ({
              actuator_type: r.actuator_type,
              action: r.action,
              // start_time: r.start_time,
              // end_time: r.end_time,

              // ✅ normalize before sending
              start_time: r.start_time ? toApiTime(r.start_time) : undefined,
              end_time: r.end_time ? toApiTime(r.end_time) : undefined,

              interval_on_min: r.interval_on_min,
              interval_off_min: r.interval_off_min,
            })),
          });

          stageId = newStage.id;
        }

        if (!firstStageId) {
          firstStageId = stageId;
        }
      }

      setAlert({ message: "✅ Saved!", type: "success" });

      if (onCreated) onCreated(firstStageId);

      onClose();

    } catch (err) {
      console.error(err);
      setAlert({ message: "❌ Failed", type: "error" });
    }
  };


  // ------------------------
  // HELPERS
  // ------------------------
  const handleUpdateStage = (index: number, data: Partial<StageWithRecipes>) => {
    setStages(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...data };
      return copy;
    });
  };

  // ✅ prevent duplicate actuator
  const addRecipe = (recipe: GrowthRecipeCreate) => {
    setStages(prev => {
      const copy = [...prev];

      const exists = copy[activeStageIndex].recipes.some(
        r => r.actuator_type === recipe.actuator_type
      );

      if (!exists) {
        copy[activeStageIndex].recipes.push(recipe);
      }

      return copy;
    });
  };

  const handleUpdateRecipe = (
    stageIndex: number,
    recipeIndex: number,
    data: RecipeWithId
  ) => {
    setStages(prev => {
      const copy = [...prev];
      copy[stageIndex].recipes[recipeIndex] = data;
      return copy;
    });
  };

  const removeRecipe = (stageIndex: number, recipeIndex: number) => {
    setStages(prev => {
      const copy = [...prev];

      copy[stageIndex].recipes = copy[stageIndex].recipes.filter(
        (_, i) => i !== recipeIndex
      );
      return copy;
    });
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
            label="Add Stage"
            variant="secondary"
            size="xs"
            rounded="full"
            icon={<IconPlus size={16} className="text-gray-500" />}
            iconPosition='left'
            onClick={() =>
              setStages(prev => [
                ...prev,
                { name: "", day_start: 0, day_end: 7, recipes: [] }
              ])
            }
          />

          {stages.map((stage, index) => (
            <div key={index} className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Stage {index + 1}</span>
                <div className="flex items-center justify-between gap-2">
                  {stages.length > 1 && (
                    <Button
                      label="Remove"
                      size="xs"
                      variant="secondary"
                      rounded="full"
                      iconOnly
                      icon={<IconTrash size={16} />}
                      onClick={() => {
                        setStages(prev => {
                          const newStages = prev.filter((_, i) => i !== index);
                          setActiveStageIndex(Math.max(0, index - 1));
                          return newStages;
                        });
                      }}
                    />
                  )}

                  <Button
                    label="Configure Recipes"
                    size="xs"
                    variant="secondary"
                    rounded="full"
                    icon={<IconSettings size={16} className="text-gray-500" />}
                    iconPosition='left'
                    onClick={() => {
                      setActiveStageIndex(index);
                      setStep(1);
                    }}
                  />
                </div>
              </div>

              <FormGroup className="space-y-1">
                <FormLabel htmlFor={`name_${index}`}>Name</FormLabel>
                <FormInput
                  id={`name_${index}`}
                  type="text"
                  value={stage.name}
                  onChange={(e) =>
                    handleUpdateStage(index, { name: e.target.value })
                  }
                />
                {fieldErrors[index]?.name && (
                  <p className="text-red-500 text-xs">
                    {fieldErrors[index].name}
                  </p>
                )}
              </FormGroup>

              <div className="flex gap-3 mb-4">
                <FormGroup className="space-y-1">
                  <FormLabel htmlFor={`day_start_${index}`}>Day Start</FormLabel>
                  <FormInput
                    id={`day_start_${index}`}   // ✅ correct template string
                    type="number"
                    className="max-w-[100px]"
                    value={stage.day_start}
                    onChange={(e) =>
                      handleUpdateStage(index, { day_start: Number(e.target.value) })
                    }
                  />
                  {fieldErrors[index]?.day_start && (
                    <p className="text-red-500 text-xs">
                      {fieldErrors[index].day_start}
                    </p>
                  )}
                </FormGroup>

                <FormGroup className="space-y-1">
                  <FormLabel htmlFor={`day_end_${index}`}>Day End</FormLabel>
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
                    <p className="text-red-500 text-xs">
                      {fieldErrors[index].day_end}
                    </p>
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
                {actuators.map((a) => {
                  const { Icon, color } = getActuatorIcon(a.type);

                  return (
                    <Button
                      key={a.id}
                      label={`${a.name}`}
                      iconPosition="left"
                      icon={<Icon size={16} className={color} />}
                      variant="secondary"
                      size="xs"
                      rounded="full"
                      className="w-30 h-10"
                      onClick={() => {
                        if (a.type === "light") {
                          addRecipe({
                            actuator_type: a.type,
                            action: "on",
                            start_time: "06:00",
                            end_time: "18:00",
                          });
                        } else if (a.type === "pump" || a.type === "water_pump") {
                          addRecipe({
                            actuator_type: a.type,
                            action: "interval",
                            interval_on_min: 5,
                            interval_off_min: 10,
                          });
                        } else if (a.type === "fan") {
                          addRecipe({
                            actuator_type: a.type,
                            action: "on",
                            start_time: "08:00",
                            end_time: "20:00",
                          });
                        } else {
                          addRecipe({
                            actuator_type: a.type,
                            action: "on",
                          });
                        }
                      }}
                    />
                  );
                })}

              </div>

              {currentStage.recipes.map((r, i) => (
                <RecipeForm
                  key={i}
                  recipe={r}
                  onChange={(data) =>
                    handleUpdateRecipe(activeStageIndex, i, data)
                  }
                  onRemove={() =>
                    removeRecipe(activeStageIndex, i)
                  }
                />
              ))}

              {fieldErrors[activeStageIndex]?.recipes && (
                <p className="text-red-500 text-xs">
                  {fieldErrors[activeStageIndex].recipes}
                </p>
              )}
            </>
          )}
        </div>
      )
    },

    {
      title: "Review",
      hideNav: true,
      component: (
        <div className="space-y-3 px-6">
          {stages.map((s, i) => (
            <div key={i} className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3">
              <b>{s.name}</b>
              <div>Day {s.day_start} → {s.day_end}</div>

              <div className="text-sm mt-2">
                {s.recipes.map((r, j) => (
                  <div key={j}>
                    - {r.actuator_type} ({r.action})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
      hideNext: true,
    },
  ];

  return (

    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo giai đoạn phát triển cây mới"
      size="small"
      content={
        <WizardLayout
          steps={steps}
          currentStep={step}
          goNext={handleNext}
          goBack={() => setStep(s => s - 1)}
        />}
      actions={
        <div className="flex justify-between w-full">
          {step > 0 ? (
            <Button
              label="Back"
              variant="secondary"
              rounded="lg"
              className="min-w-[150px]"
              onClick={() => setStep(s => s - 1)}
            />
          ) : <div />}

          {step < steps.length - 1 ? (
            <Button
              label="Next"
              rounded="lg"
              onClick={handleNext}
              className="min-w-[150px]"
            />
          ) : (
            <Button
              label="✅ Create"
              rounded="lg"
              className="min-w-[150px]"
              onClick={handleCreateAll}
            />
          )}
        </div>
      }
    />
  );
};

export default StageRecipeWizardModal;