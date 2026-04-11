// validation/growthStageValidation.ts
import * as Yup from "yup";
import { recipeArraySchema } from "./recipeValidation";
export const stageSchema = Yup.object({
  name: Yup.string().required("Stage name is required"),
  day_start: Yup.number()
    .min(0, "Must be >= 0")
    .required("Start day is required"),
  day_end: Yup.number()
    .moreThan(Yup.ref("day_start"), "End must be greater than start")
    .required("End day is required"),
});

export const recipeSchema = recipeArraySchema;