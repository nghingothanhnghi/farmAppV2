// src/validations/actuatorSchema.ts
import * as Yup from "yup";

import { ESP32_GPIO_PINS } from "../constants/gpio";

const validPinNumbers = ESP32_GPIO_PINS.map(p => p.number);

export const actuatorSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Too short"),

  type: Yup.string()
    .required("Type is required"),

  pin: Yup.number()
    .typeError("Pin must be a number")
    .required("Pin is required")
    .oneOf(validPinNumbers, "Invalid GPIO pin"), // 🔥 BEST

  port: Yup.number()
    .typeError("Port must be a number")
    .required("Port is required")
    .min(1, "Min port = 1"),

  sensor_key: Yup.string().nullable(),

  is_active: Yup.boolean(),

  default_state: Yup.boolean(),
});