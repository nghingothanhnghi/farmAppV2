// src/components/HydroponicSystemPage/components/DeviceForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router'; // Add this at the top of your file
import { useHydroSystem } from '../../../hooks/useHydroSystem';
import type { HydroActuator } from '../../../models/interfaces/HydroSystem';
import Form, { FormGroup, FormLabel, FormInput, FormActions } from '../../../components/common/Form';
import Button from '../../../components/common/Button';
import type { HydroDevice } from '../../../models/interfaces/HydroSystem';
import ActuatorCard from './ActuatorCard';
import EmptyState from '../../common/EmptyState';
import noDataAnimation from '../../../assets/lottie/empty_data.json'

type Props = {
    formData: Partial<HydroDevice>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    isEdit: boolean;
    fieldErrors: Record<string, string>;
};

const fields: [keyof HydroDevice, string, string, boolean, string?][] = [
    ['name', 'Tên thiết bị', 'text', true, 'Tên gọi để bạn dễ nhớ. Ví dụ: "Andruno 1, Esp32 WROM Dev".'],
    ['device_id', 'Mã thiết bị', 'text', true, 'Mã riêng của thiết bị (không trùng nhau). thường là serial number'],
    ['location', 'Vị trí đặt', 'text', false, 'Có thể bỏ qua. Ví dụ: \"Khu trồng A\".'],
    ['type', 'Loại thiết bị', 'text', false, 'Ví dụ: cảm biến, máy bơm, bộ điều khiển.'],
];

const DeviceForm: React.FC<Props> = ({
    formData,
    onChange,
    onSubmit,
    loading,
    isEdit,
    fieldErrors,
}) => {
    const navigate = useNavigate();
    const { actions } = useHydroSystem();
    const [actuators, setActuators] = useState<HydroActuator[]>([]);


    const loadActuators = React.useCallback(async () => {
        if (!formData.id) return;
        const data = await actions.fetchActuatorsByDevice(formData.id);
        setActuators(data);
    }, [formData.id]);

    useEffect(() => {
        if (isEdit && formData.id) {
            loadActuators();
        }
    }, [isEdit, formData.id, loadActuators]);
    return (
        <Form onSubmit={onSubmit} className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {fields.map(([name, label, type, required, helper]) => (
                        <FormGroup key={name} className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                            <div className="space-y-1">
                                <FormLabel htmlFor={name}>{label}</FormLabel>
                                {helper && (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {helper}
                                    </p>
                                )}
                            </div>
                            <div>
                                <FormInput
                                    id={name}
                                    name={name}
                                    type={type}
                                    value={(formData[name] ?? '') as string | number}
                                    onChange={onChange}
                                    required={required}
                                />
                                {fieldErrors[name] && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors[name]}</p>
                                )}
                            </div>
                        </FormGroup>
                    ))}
                </div>
                <div className='flex flex-col shadow-sm border border-gray-100 dark:bg-gray-800/80 dark:border-gray-700 rounded-lg space-y-0.5'>
                    <div className='p-4'>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 line-clamp-1">Linked Actuators</h3>
                    </div>
                    {actuators.length > 0 ? (
                        <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
                            {actuators.map((actuator) => (
                                <ActuatorCard
                                    key={actuator.id}
                                    actuator={actuator}
                                    allActuators={actuators}
                                    variant="linked"
                                    onUpdated={loadActuators}
                                    onToggle={(id, active) => {
                                        actions.patchActuator(id, { is_active: active }).then(loadActuators);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            animationData={noDataAnimation}
                            message="No actuators linked to this device"
                        />
                    )}
                </div>
            </div>
            <hr className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5" />
            <FormActions className='lg:static fixed bottom-0 left-0 right-0 p-4 lg:pl-4 lg:pr-0 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-end gap-4'>
                <Button
                    type="button"
                    label="Back"
                    variant="secondary"
                    onClick={() => navigate('/hydro-devices')}
                    className="md:w-auto"
                    fullWidth={true}
                    rounded='lg'
                />
                <Button
                    type="submit"
                    label={
                        loading
                            ? isEdit
                                ? 'Updating...'
                                : 'Creating...'
                            : isEdit
                                ? 'Update Device'
                                : 'Create Device'
                    }
                    disabled={loading}
                    variant="primary"
                    className="md:w-auto"
                    fullWidth={true}
                    rounded='lg'
                />
            </FormActions>
        </Form>
    );
};

export default DeviceForm;
