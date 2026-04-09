// src/components/PlantBatch/components/BatchForm.tsx
import React, { useState, useEffect } from "react";
import { IconPlus } from '@tabler/icons-react';
import type { PlantBatch } from "../../../models/interfaces/PlantBatch";
import { usePlants } from "../../../hooks/usePlants";
import { useHydroDevices } from "../../../hooks/useHydroDevices"
import CreatePlantModal from "./CreatePlantModal";
import StageRecipeWizardModal from "./StageRecipeWizardModal";

import Form, {
    FormGroup,
    FormLabel,
    FormInput,
    FormSelect,
    FormActions
} from "../../common/Form";
import Button from "../../common/Button";

type Props = {
    formData: Partial<PlantBatch>;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    loading: boolean;
    isEdit?: boolean;
    hasRecipeConfig?: boolean;
    fieldErrors: Record<string, string>;
};

const BatchForm: React.FC<Props> = ({
    formData,
    onChange,
    onSubmit,
    onCancel,
    loading,
    isEdit,
    hasRecipeConfig,
    fieldErrors
}) => {
    const { plants, loading: plantLoading } = usePlants();
    const [localPlants, setLocalPlants] = useState(plants);

    const { devices, loading: deviceLoading } = useHydroDevices();

    const [openPlantModal, setOpenPlantModal] = useState(false);
    const [openWizard, setOpenWizard] = useState(false);

    const isEditingRecipe = isEdit && hasRecipeConfig;

    useEffect(() => {
        setLocalPlants(plants);
    }, [plants]);

    useEffect(() => {
        if (formData.plant_id && !formData.start_date) {
            onChange({
                target: {
                    name: "start_date",
                    value: new Date().toISOString().split("T")[0],
                },
            } as any);
        }
    }, [formData.plant_id]);

    return (
        <>

            <Form onSubmit={onSubmit} className="max-w-xl mx-auto space-y-5">
                <FormGroup className="space-y-1">
                    <FormLabel htmlFor="plant_id">Plant ID</FormLabel>
                    <div className="flex items-center gap-4">
                        <FormSelect
                            id="plant_id"
                            name="plant_id"
                            value={formData.plant_id || ""}
                            onChange={onChange}
                            disabled={plantLoading}
                            className="min-w-0 flex-1"
                        >
                            <option value="">Select plant</option>

                            {localPlants.map((plant) => (
                                <option key={plant.id} value={plant.id}>
                                    {plant.name}
                                </option>
                            ))}
                        </FormSelect>
                        <Button
                            variant="secondary"
                            icon={<IconPlus size={18} />}
                            iconOnly
                            rounded='full'
                            label="Add plant"
                            className='bg-transparent'
                            onClick={() => setOpenPlantModal(true)}
                        />
                    </div>

                    {plantLoading && <p>Loading plants...</p>}
                    {fieldErrors.plant_id && <p>{fieldErrors.plant_id}</p>}
                </FormGroup>

                <FormGroup className="space-y-1">
                    <FormLabel htmlFor="zone_id">Zone ID</FormLabel>
                    <FormSelect
                        id="zone_id"
                        name="zone_id"
                        value={formData.zone_id || ""}
                        onChange={onChange}
                    >
                        <option value="">Chọn thiết bị</option>
                        {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                                {device.device_id} - {device.location || "Không có vị trí"} {device.is_active ? "🟢 Online" : "🔴 Offline"}
                            </option>
                        ))}
                    </FormSelect>

                    {deviceLoading && <p>Đang tải thiết bị...</p>}
                    {fieldErrors.zone_id && <p>{fieldErrors.zone_id}</p>}
                </FormGroup>

                <FormGroup className="space-y-1">
                    <FormLabel htmlFor="start_date">Start Date</FormLabel>
                    <FormInput
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={formData.start_date || ''}
                        onChange={onChange}
                    />
                    {fieldErrors.start_date && <p>{fieldErrors.start_date}</p>}
                </FormGroup>
                <Button
                    label={
                        isEditingRecipe
                            ? "✏️ Edit Stage & Automation"
                            : "⚙️ Create Stage & Automation"
                    }
                    variant="secondary"
                    onClick={() => setOpenWizard(true)}
                    disabled={!formData.plant_id || !formData.zone_id}
                />
                <FormActions className="flex justify-end gap-4 mt-6">
                    <Button
                        type="submit"
                        rounded="lg"
                        label={
                            loading
                                ? "Đang lưu..."
                                : isEdit
                                    ? "Cập nhật"
                                    : "Tạo mới"
                        }
                        className='min-w-[150px]'
                    />
                    <Button
                        label="Thoát"
                        variant="secondary"
                        rounded="lg"
                        className='min-w-[150px]'
                        onClick={onCancel}
                    />
                </FormActions>
            </Form>

            <StageRecipeWizardModal
                isOpen={openWizard}
                plantId={formData.plant_id || null}
                zoneId={formData.zone_id || null}
                onClose={() => setOpenWizard(false)}
            />

            <CreatePlantModal
                isOpen={openPlantModal}
                onClose={() => setOpenPlantModal(false)}
                onCreated={(plant) => {
                    // ✅ add new plant into dropdown
                    setLocalPlants(prev => [...prev, plant]);

                    // ✅ auto select
                    onChange({
                        target: {
                            name: "plant_id",
                            value: plant.id,
                        },
                    } as any);
                }}
            />
        </>
    );
};

export default BatchForm;