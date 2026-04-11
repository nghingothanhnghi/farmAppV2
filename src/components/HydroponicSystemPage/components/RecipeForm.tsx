import { useState } from "react";
import Button from "../../common/Button";
import { IconTrash } from '@tabler/icons-react';
import {
    FormGroup,
    FormLabel,
    FormInput,
    FormToggle
} from "../../common/Form";
import type { GrowthRecipeCreate } from "../../../models/interfaces/GrowthRecipe";
import { recipeItemSchema } from "../../../validation/recipeValidation";

type Props = {
    recipe: GrowthRecipeCreate;
    onChange: (data: GrowthRecipeCreate) => void;
    onRemove: () => void;
};

const RecipeForm: React.FC<Props> = ({ recipe, onChange, onRemove }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isInterval = recipe.action === "interval";

    const update = async (data: Partial<GrowthRecipeCreate>) => {
        const newRecipe = { ...recipe, ...data };

        try {
            await recipeItemSchema.validate(newRecipe, { abortEarly: false });
            setErrors({});
        } catch (err: any) {
            const e: Record<string, string> = {};
            err.inner.forEach((x: any) => {
                e[x.path] = x.message;
            });
            setErrors(e);
        }

        onChange(newRecipe);
    };

    return (
        <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3">
            {/* Header */}
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">{recipe.actuator_type}</span>
                <div className="flex items-center justify-between gap-2">
                    <Button
                        label="Remove"
                        size="xs"
                        variant="secondary"
                        rounded="full"
                        iconOnly
                        icon={<IconTrash size={16} />}
                        onClick={onRemove}
                    />

                </div>
            </div>

            {/* Mode Switch */}
            <FormGroup className="space-y-1">
                <FormLabel htmlFor="mode">Mode</FormLabel>
                <FormToggle
                    id={`mode-${recipe.actuator_type}`}
                    checked={isInterval}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update({
                            action: e.target.checked ? "interval" : "on",
                            start_time: e.target.checked ? undefined : "06:00:00",
                            end_time: e.target.checked ? undefined : "18:00:00",
                            interval_on_min: e.target.checked ? 5 : undefined,
                            interval_off_min: e.target.checked ? 10 : undefined,
                        })
                    }
                />
                <span className="text-xs text-gray-500">
                    {isInterval ? "Interval mode" : "Time range mode"}
                </span>
            </FormGroup>

            {/* TIME MODE */}
            {!isInterval && (
                <div className="flex gap-3">
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="start_time">Start</FormLabel>
                        <FormInput
                            type="time"
                            id="start_time"
                            className="max-w-[100px]"
                            value={recipe.start_time || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                update({ start_time: e.target.value })
                            }
                        />
                        {errors.start_time && (
                            <p className="text-red-500 text-xs">{errors.start_time}</p>
                        )}
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="">End</FormLabel>
                        <FormInput
                            id="end_time"
                            type="time"
                            className="max-w-[100px]"
                            value={recipe.end_time || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                update({ end_time: e.target.value })
                            }
                        />
                        {errors.end_time && (
                            <p className="text-red-500 text-xs">{errors.end_time}</p>
                        )}
                    </FormGroup>
                </div>
            )}

            {/* INTERVAL MODE */}
            {isInterval && (
                <div className="flex gap-3">
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor={`interval-on-${recipe.actuator_type}`}>ON (min)</FormLabel>
                        <FormInput
                            className="max-w-[100px]"
                            type="number"
                            id={`interval-on-${recipe.actuator_type}`}
                            value={recipe.interval_on_min || 0}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                update({ interval_on_min: Number(e.target.value) })
                            }
                        />
                        {errors.interval_on_min && (
                            <p className="text-red-500 text-xs">{errors.interval_on_min}</p>
                        )}
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor={`interval-off-${recipe.actuator_type}`}>OFF (min)</FormLabel>
                        <FormInput
                            type="number"
                            id={`interval-off-${recipe.actuator_type}`}
                            value={recipe.interval_off_min || 0}
                            className="max-w-[100px]"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                update({ interval_off_min: Number(e.target.value) })
                            }
                        />
                        {errors.interval_off_min && (
                            <p className="text-red-500 text-xs">{errors.interval_off_min}</p>
                        )}
                    </FormGroup>
                </div>
            )}
        </div>
    );
};

export default RecipeForm;