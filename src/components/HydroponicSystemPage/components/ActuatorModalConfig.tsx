// src/components/HydroponicSystemPage/components/ActuatorModalConfig.tsx

import React, { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import type { HydroActuator } from "../../../models/interfaces/HydroSystem";
import { FormGroup, FormInput, FormLabel, FormSelect, FormToggle } from "../../common/Form";
import { actuatorSchema } from "../../../validation/actuatorSchema";
import { ESP32_GPIO_PINS } from "../../../constants/gpio";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    actuator: HydroActuator | null;
    onSubmit: (id: number, data: Partial<HydroActuator>) => Promise<void>;
}

const actuatorTypes = [
    { label: "Pump", value: "pump" },
    { label: "Fan", value: "fan" },
    { label: "Light", value: "light" },
    { label: "Water Pump", value: "water_pump" },
    { label: "Valve", value: "valve" },
];

const ActuatorModalConfig: React.FC<Props> = ({
    isOpen,
    onClose,
    actuator,
    onSubmit,
}) => {
    const [form, setForm] = useState<Partial<HydroActuator>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (actuator) {
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
        }
    }, [actuator]);

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
            onClose();
        } catch (err: any) {
            console.log("VALIDATION ERROR:", err);
            if (err.inner) {
                const formatted: Record<string, string> = {};
                err.inner.forEach((e: any) => {
                    formatted[e.path] = e.message;
                });
                setErrors(formatted);
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
                <div className="px-10 pb-4 space-y-5">
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
                        <FormLabel htmlFor="type">Type</FormLabel>
                        <FormSelect
                            id="type"
                            name="type"
                            value={form.type || ""}
                            onChange={(e) => handleChange("type", e.target.value)}
                        >
                            <option value="">Select type</option>
                            {actuatorTypes.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </FormSelect>
                        {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
                    </FormGroup>
                    <div className="flex gap-4">
                        <FormGroup className="space-y-1">
                            <FormLabel htmlFor="pin">Pin</FormLabel>
                            <FormSelect
                                id="pin"
                                value={form.pin || ""}
                                onChange={(e) => handleChange("pin", e.target.value)}
                            >
                                <option value="">Select GPIO</option>

                                {ESP32_GPIO_PINS.map((pin) => (
                                    <option key={pin.number} value={`${pin.number}`}>
                                        {pin.label}
                                        {pin.warning ? ` ⚠️ ${pin.warning}` : ""}
                                        {pin.usage ? ` (${pin.usage})` : ""}
                                    </option>
                                ))}
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
                    <div className="flex justify-between pt-2">
                        <label>
                            <input
                                type="checkbox"
                                checked={form.is_active || false}
                                onChange={(e) => handleChange("is_active", e.target.checked)}
                            />{" "}
                            Active
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={form.default_state || false}
                                onChange={(e) => handleChange("default_state", e.target.checked)}
                            />{" "}
                            Default ON
                        </label>
                    </div>
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button
                        label="Cancel"
                        variant="secondary"
                        rounded="lg"
                        className="min-w-[150px]"
                        onClick={onClose}
                    />
                    <Button
                        label={loading ? "Saving..." : "Save"}
                        onClick={handleSubmit}
                        className="min-w-[150px]"
                        rounded="lg"
                        disabled={loading}
                    />
                </div>
            }
        />
    );
};

export default ActuatorModalConfig;