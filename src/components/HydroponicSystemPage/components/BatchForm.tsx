// src/components/PlantBatch/components/BatchForm.tsx
import React, { useState, useEffect } from "react";
import { IconPlus } from '@tabler/icons-react';
import type { PlantBatch } from "../../../models/interfaces/PlantBatch";
import { usePlants } from "../../../hooks/usePlants";
import { useHydroDevices } from "../../../hooks/useHydroDevices"
import CreatePlantModal from "./CreatePlantModal";

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
    loading: boolean;
    isEdit?: boolean;
    fieldErrors: Record<string, string>;
};

const BatchForm: React.FC<Props> = ({
    formData,
    onChange,
    onSubmit,
    loading,
    isEdit,
    fieldErrors
}) => {
    const { plants, loading: plantLoading } = usePlants();
    const [localPlants, setLocalPlants] = useState(plants);

    const { devices, loading: deviceLoading } = useHydroDevices();

    const [openPlantModal, setOpenPlantModal] = useState(false);

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

            <Form onSubmit={onSubmit} className="max-w-xl mx-auto">
                <FormGroup>
                    <FormLabel htmlFor="plant_id">Plant ID</FormLabel>
                    <div className="flex items-center gap-4">
                        <FormSelect
                            id="plant_id"
                            name="plant_id"
                            value={formData.plant_id || ""}
                            onChange={onChange}
                            disabled={plantLoading}
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

                <FormGroup>
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

                <FormGroup>
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

                <FormActions className="flex justify-end gap-4 mt-6">
                    <Button label="Huỷ" variant="secondary" />
                    <Button
                        type="submit"
                        label={
                            loading
                                ? "Đang lưu..."
                                : isEdit
                                    ? "Cập nhật"
                                    : "Tạo mới"
                        }
                    />
                </FormActions>
            </Form>

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