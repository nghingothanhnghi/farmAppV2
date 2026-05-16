// src/components/HydroponicSystemPage/components/ActuatorModalConfig.tsx

import React, { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useAlert } from "../../../contexts/alertContext";
import { useFormDirty } from "../../../hooks/useFormDirty";
import type { HydroActuator } from "../../../models/interfaces/HydroSystem";
import { FormGroup, FormInput, FormLabel, FormSelect, FormToggle } from "../../common/Form";
import { actuatorSchema } from "../../../validation/actuatorSchema";
import { ESP32_GPIO_PINS } from "../../../constants/gpio";
import { ACTUATOR_TYPES } from "../../../constants/actuator";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    actuator: HydroActuator | null;
    onSubmit: (id: number, data: Partial<HydroActuator>) => Promise<void>;
    usedPins?: string[];
}

const ActuatorModalConfig: React.FC<Props> = ({
    isOpen,
    onClose,
    actuator,
    onSubmit,
    usedPins = [],
}) => {

    
    const [form, setForm] = useState<Partial<HydroActuator>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isDirty = useFormDirty(form, actuator);

    const [loading, setLoading] = useState(false);
    const { setAlert } = useAlert();

    useEffect(() => {
        if (!isOpen || !actuator) return;

        setForm({
            name: actuator.name,
            type: actuator.type,
            pin: actuator.pin,
            port: actuator.port,
            is_active: actuator.is_active,
            default_state: actuator.default_state,
            sensor_key: actuator.sensor_key,
        });

        setErrors({});
    }, [isOpen, actuator?.id]);

    const handleChange = (key: keyof HydroActuator, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (!actuator) return;

        try {
            setLoading(true);

            // ✅ Validate with Yup
            await actuatorSchema.validate(form, { abortEarly: false });

            setErrors({});

            await onSubmit(actuator.id, form);

            // ✅ SUCCESS ALERT
            setAlert({
                message: `${form.name || actuator.name} updated successfully.`,
                type: "success",
            });

            onClose();
        } catch (err: any) {
            console.log("VALIDATION ERROR:", err);

            // ✅ Backend/FastAPI error
            const apiMessage =
                err?.response?.data?.detail;

            if (apiMessage) {

                // Optional: show under pin field
                setErrors(prev => ({
                    ...prev,
                    pin: apiMessage,
                }));

                setAlert({
                    message: apiMessage,
                    type: "error",
                });

                return;
            }

            // ✅ Yup validation errors
            if (err.inner) {
                const formatted: Record<string, string> = {};
                err.inner.forEach((e: any) => {
                    formatted[e.path] = e.message;
                });
                setErrors(formatted);

                setAlert({
                    message: "Please fix validation errors.",
                    type: "error",
                });
            } else {
                // ✅ API/server errors
                setAlert({
                    message: err?.message || "Failed to update actuator.",
                    type: "error",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Actuator"
            size="small"
            content={
                <div className="px-10 pb-4 space-y-4">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <FormGroup className="space-y-1">
                            <FormLabel htmlFor="name">Tên thiết bị</FormLabel>
                            <FormInput
                                id="name"
                                type="text"
                                value={form.name || ""}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="Nhập tên thiết bị"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            )}
                        </FormGroup>
                        {/* TYPE */}
                        <FormGroup className="flex flex-col space-y-1">
                            <FormLabel htmlFor="type">Loại</FormLabel>
                            <FormSelect
                                id="type"
                                name="type"
                                value={form.type || ""}
                                onChange={(e) => handleChange("type", e.target.value)}
                            >
                                <option value="">Select type</option>
                                {ACTUATOR_TYPES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </FormSelect>
                            {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
                        </FormGroup>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <FormGroup className="space-y-1">
                            <FormLabel htmlFor="pin">Kênh</FormLabel>
                            <FormSelect
                                id="pin"
                                value={form.pin || ""}
                                onChange={(e) => handleChange("pin", e.target.value)}
                            >
                                <option value="">Chọn GPIO</option>
                                {ESP32_GPIO_PINS.map((pin) => {

                                    const pinValue = `${pin.number}`;

                                    // allow current actuator pin
                                    const isCurrentPin =
                                        pinValue === `${actuator?.pin}`;

                                    const isUsed =
                                        usedPins.includes(pinValue) &&
                                        !isCurrentPin;

                                    return (
                                        <option
                                            key={pin.number}
                                            value={pinValue}
                                            disabled={isUsed}
                                        >
                                            {pin.label}

                                            {pin.warning
                                                ? ` ⚠️ ${pin.warning}`
                                                : ""}

                                            {pin.usage
                                                ? ` (${pin.usage})`
                                                : ""}

                                            {isUsed
                                                ? " — Already Used"
                                                : ""}
                                        </option>
                                    );
                                })}
                            </FormSelect>
                            {errors.pin && (
                                <p className="text-red-500 text-xs">{errors.pin}</p>
                            )}
                        </FormGroup>
                        <FormGroup className="space-y-1">
                            <FormLabel htmlFor="port">Port</FormLabel>
                            <FormInput
                                id="port"
                                type="number"
                                value={form.port || 0}
                                onChange={(e) => handleChange("port", Number(e.target.value))}
                                placeholder="Port"
                            />
                            {errors.port && <p className="text-red-500 text-xs">{errors.port}</p>}
                        </FormGroup>
                    </div>
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="sensor_key">Sensor Key</FormLabel>
                        <FormInput
                            id="sensor_key"
                            type="text"
                            value={form.sensor_key || ""}
                            onChange={(e) => handleChange("sensor_key", e.target.value)}
                            placeholder="Sensor key (optional)"
                        />
                        {errors.sensor_key && (
                            <p className="text-red-500 text-xs">{errors.sensor_key}</p>
                        )}
                    </FormGroup>
                    <div className="space-y-2">
                        {/* ENABLED */}
                        <FormGroup className="flex items-center justify-between rounded-lg dark:bg-gray-800 border border-gray-200 dark:border-white/5 px-3 py-2">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Enabled
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    Allow actuator automation & control
                                </p>
                            </div>
                            <FormToggle
                                id="is_active"
                                checked={form.is_active || false}
                                onChange={(e) =>
                                    handleChange("is_active", e.target.checked)
                                }
                            />
                        </FormGroup>
                        {/* DEFAULT STATE */}
                        <FormGroup className="flex items-center justify-between rounded-lg dark:bg-gray-800 border border-gray-200 dark:border-white/5 px-3 py-2">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Default ON
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    Initial state when device boots
                                </p>
                            </div>

                            <FormToggle
                                id="default_state"
                                checked={form.default_state || false}
                                onChange={(e) =>
                                    handleChange("default_state", e.target.checked)
                                }
                            />
                        </FormGroup>
                    </div>
                </div>
            }
            actions={
                <div className="flex gap-4">
                    <Button
                        label={loading ? "Saving..." : "Save"}
                        onClick={handleSubmit}
                        className="min-w-[150px]"
                        rounded="lg"
                        disabled={loading || !isDirty}
                    />
                    <Button
                        label="Cancel"
                        variant="secondary"
                        rounded="lg"
                        className="min-w-[150px]"
                        onClick={onClose}
                    />
                </div>
            }
        />
    );
};

export default ActuatorModalConfig;