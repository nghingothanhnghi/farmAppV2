// src/components/PlantBatch/components/BatchForm.tsx
import React, { useState, useEffect } from "react";
import { IconPlus, IconSettings } from '@tabler/icons-react';
import type { PlantBatch } from "../../../models/interfaces/PlantBatch";
import { usePlants } from "../../../hooks/usePlants";
import { useHydroDevices } from "../../../hooks/useHydroDevices"
import { useGrowthPlansByPlant } from "../../../hooks/useGrowthPlans";
import { usePlantBatchContext } from "../../../contexts/plantBatchContext";
import CreatePlantModal from "./CreatePlantModal";
import StageRecipeWizardModal from "./StageRecipeWizardModal";
import GrowthPlanList from "./GrowthPlanList";
import Modal from "../../common/Modal";

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

    // 👇 NEW — plans for the currently selected plant
    const {
        plans,
        loaded: plansLoaded,
        loading: plansLoading,
    } = useGrowthPlansByPlant(formData.plant_id);

    const [openPlantModal, setOpenPlantModal] = useState(false);
    const [openWizard, setOpenWizard] = useState(false);
    const [openPlanManager, setOpenPlanManager] = useState(false); // 👈 NEW

    const { currentBatch, setStage } = usePlantBatchContext();

    const isEditingRecipe = isEdit && hasRecipeConfig;

    const setPlanId = (planId: number | null) => {
        onChange({
            target: { name: "plan_id", value: planId == null ? "" : planId },
        } as any);
    };

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

    // 👇 NEW — keep plan_id consistent with the selected plant
    useEffect(() => {
        const current = formData.plan_id ?? null;

        // no plant → no plan
        if (!formData.plant_id) {
            if (current !== null) setPlanId(null);
            return;
        }

        // wait until plans for THIS plant have arrived
        if (!plansLoaded) return;

        // current selection still belongs to this plant → keep it
        if (current !== null && plans.some((p) => p.id === current)) return;

        // otherwise pre-select the default (user can still override)
        const defaultPlan = plans.find((p) => p.is_default);
        if (defaultPlan) setPlanId(defaultPlan.id);
        else if (current !== null) setPlanId(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.plant_id, formData.plan_id, plans, plansLoaded]);

    const noPlansForPlant = !!formData.plant_id && plansLoaded && !plansLoading && plans.length === 0;

    return (
        <>
            <Form onSubmit={onSubmit} className="space-y-10 mx-auto max-w-4xl">
                <div className="space-y-5">
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="plant_id">Cây trồng</FormLabel>
                        <div className="flex items-center gap-4">
                            <FormSelect
                                id="plant_id"
                                name="plant_id"
                                value={formData.plant_id || ""}
                                onChange={onChange}
                                disabled={plantLoading}
                                className="min-w-0 flex-1"
                            >
                                <option value="">Chọn cây trồng</option>

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

                        {plantLoading && <p>Đang tải cây trồng...</p>}
                        {fieldErrors.plant_id && <p>{fieldErrors.plant_id}</p>}
                    </FormGroup>

                    {/* 👇 NEW — Growth Plan */}
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="plan_id">Kế hoạch trồng</FormLabel>
                        <div className="flex items-center gap-4">
                            <FormSelect
                                id="plan_id"
                                name="plan_id"
                                value={formData.plan_id ?? ""}
                                onChange={onChange}
                                disabled={!formData.plant_id || plansLoading || plans.length === 0}
                                className="min-w-0 flex-1"
                            >
                                <option value="">
                                    {!formData.plant_id ? "Chọn cây trồng trước" : "Chọn kế hoạch"}
                                </option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name}{plan.is_default ? " (mặc định)" : ""}
                                    </option>
                                ))}
                            </FormSelect>
                            <Button
                                variant="secondary"
                                icon={<IconSettings size={18} />}
                                iconOnly
                                rounded='full'
                                label="Manage growth plans"
                                className='bg-transparent'
                                disabled={!formData.plant_id}
                                onClick={() => setOpenPlanManager(true)}
                            />
                        </div>

                        {plansLoading && <p>Đang tải kế hoạch...</p>}
                        {noPlansForPlant && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Cây trồng này chưa có kế hoạch trồng — hãy tạo một kế hoạch trước
                                (This plant has no growth plan yet — create one first).
                            </p>
                        )}
                        {fieldErrors.plan_id && <p>{fieldErrors.plan_id}</p>}
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="zone_id">Thiết bị/Khu vực</FormLabel>
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
                        <FormLabel htmlFor="start_date">Ngày bắt đầu</FormLabel>
                        <FormInput
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={formData.start_date || ''}
                            onChange={onChange}
                        />
                        {fieldErrors.start_date && <p>{fieldErrors.start_date}</p>}
                    </FormGroup>
                    <div className="flex justify-end">
                        <Button
                            label={
                                isEditingRecipe
                                    ? "✏️ Chỉnh sửa giai đoạn & tự động hóa"
                                    : "⚙️ Create Stage & Automation"
                            }
                            variant="secondary"
                            rounded="lg"
                            onClick={() => setOpenWizard(true)}
                            disabled={!isEdit} // 👉 only allow when batch is created (edit mode)
                        />
                    </div>
                </div>
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
                onCreated={(stageId) => {
                    console.log("✅ Wizard created stage:", stageId);
                    if (!stageId) return;

                    // 🔥 ONLY works when batch exists (edit mode)
                    if (isEdit && currentBatch && stageId) {
                        setStage(currentBatch.id, stageId);
                    }
                }}
            />

            <CreatePlantModal
                isOpen={openPlantModal}
                onClose={() => setOpenPlantModal(false)}
                onCreated={(plant) => {
                    // ✅ add new plant into dropdown
                    setLocalPlants(prev =>
                        prev.some(p => p.id === plant.id) ? prev : [...prev, plant]
                    );

                    // ✅ auto select
                    onChange({
                        target: {
                            name: "plant_id",
                            value: plant.id,
                        },
                    } as any);
                }}
            />

            {/* 👇 NEW — manage plans without leaving the form */}
            <Modal
                isOpen={openPlanManager}
                onClose={() => setOpenPlanManager(false)}
                title="Kế hoạch trồng"
                size="medium"
                content={
                    <div className="px-6 pb-4">
                        <GrowthPlanList plantId={formData.plant_id} />
                    </div>
                }
                actions={
                    <Button
                        label="Đóng"
                        variant="secondary"
                        rounded="lg"
                        className="min-w-[150px]"
                        onClick={() => setOpenPlanManager(false)}
                    />
                }
            />
        </>
    );
};

export default BatchForm;