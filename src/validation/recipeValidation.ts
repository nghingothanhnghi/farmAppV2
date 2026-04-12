import * as Yup from "yup";

export const recipeItemSchema = Yup.object({
  actuator_type: Yup.string().required(),
  action: Yup.string().required(),

  start_time: Yup.string()
    .nullable()
    .when("action", {
      is: "on",
      then: (s) => s.required("Start time required"),
      otherwise: (s) => s.notRequired(),
    }),

  end_time: Yup.string()
    .nullable()
    .when("action", {
      is: "on",
      then: (s) => s.required("End time required"),
      otherwise: (s) => s.notRequired(),
    }),

  interval_on_min: Yup.number()
    .nullable()
    .transform((v) => (isNaN(v) ? null : v)) // 🔥 IMPORTANT
    .when("action", {
      is: "interval",
      then: (s) => s.required("Required").min(1, "Min 1"),
      otherwise: (s) => s.notRequired(),
    }),

  interval_off_min: Yup.number()
    .nullable()
    .transform((v) => (isNaN(v) ? null : v)) // 🔥 IMPORTANT
    .when("action", {
      is: "interval",
      then: (s) => s.required("Required").min(1, "Min 1"),
      otherwise: (s) => s.notRequired(),
    }),
});

export const recipeArraySchema = Yup.array()
  .of(recipeItemSchema)
  .min(1, "At least one recipe is required");