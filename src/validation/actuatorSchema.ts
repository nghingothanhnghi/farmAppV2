// src/validations/actuatorSchema.ts
import * as Yup from "yup";

export const actuatorSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Too short"),

  type: Yup.string()
    .required("Type is required"),

  pin: Yup.string()
    .nullable()
    .matches(/^GPIO\d+$/, "Format must be GPIOxx (e.g. GPIO23)")
    .notRequired(),

  port: Yup.number()
    .typeError("Port must be a number")
    .required("Port is required")
    .min(1, "Min port = 1"),

  sensor_key: Yup.string().nullable(),

  is_active: Yup.boolean(),

  default_state: Yup.boolean(),
});