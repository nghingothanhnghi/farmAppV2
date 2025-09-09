// src/components/Hydro/HydroponicDevicePage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { IconPlus } from '@tabler/icons-react';
import Button from '../../components/common/Button';
import PageTitle from '../../components/common/PageTitle';
import * as Yup from 'yup';
import { useAlert } from '../../contexts/alertContext';
import { deviceService } from '../../services/hydroDeviceService';
import type { HydroDevice } from '../../models/interfaces/HydroSystem';
import DeviceList from './components/DeviceList';
import DeviceForm from './components/DeviceForm';

const deviceSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    device_id: Yup.string().required('Device ID is required'),
    location: Yup.string(),
    type: Yup.string(),
});

const HydroponicDevicePage: React.FC = () => {
    const { setAlert } = useAlert();
    const navigate = useNavigate();

    const { id } = useParams(); // For edit

    const location = useLocation();
    const isRootPage = location.pathname === '/hydro-devices';
    const isCreate = location.pathname === '/hydro-devices/new-device';
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<Partial<HydroDevice>>({
        name: '',
        device_id: '',
        location: '',
        type: '',
    });

    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isEdit) {
            deviceService
                .get(Number(id))
                .then(setFormData)
                .catch(() => setAlert({ type: 'error', message: 'Failed to fetch device data' }));
        } else if (isCreate) {
            setFormData({
                name: '',
                device_id: '',
                location: '',
                type: '',
            });
            setFieldErrors({});
        }
    }, [id, isCreate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await deviceSchema.validate(formData, { abortEarly: false });
            setFieldErrors({});
            if (isEdit) {
                await deviceService.update(Number(id), formData as HydroDevice);
                setAlert({ message: 'Device updated successfully!', type: 'success' });
            } else {
                await deviceService.create(formData as HydroDevice);
                setAlert({ message: 'Device created successfully!', type: 'success' });
            }
            navigate('/hydro-devices');
        } catch (err: any) {
            if (err.name === 'ValidationError') {
                const errors: Record<string, string> = {};
                err.inner.forEach((e: Yup.ValidationError) => {
                    if (e.path) errors[e.path] = e.message;
                });
                setFieldErrors(errors);
            } else {
                setAlert({
                    message: err?.response?.data?.detail || 'Error occurred',
                    type: 'error',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col h-full'>
            {!isRootPage && (
                <PageTitle
                    title={isEdit ? 'Edit Device' : 'Create Device'}
                    actions={
                        !isCreate && ( // ✅ Only show the Add button when NOT creating
                            <Button
                                variant="secondary"
                                icon={<IconPlus size={18} />}
                                iconOnly
                                rounded='full'
                                label="Close"
                                className='bg-transparent'
                                onClick={() => navigate('/hydro-devices/new-device')}
                            />
                        )
                    }
                />
            )}
            {isRootPage && (
                <>
                    <PageTitle
                        title="Device Managament"
                        subtitle={
                            <>
                                Manage your hydroponic devices like ESP32 boards and microcontrollers. Each device is uniquely
                                identified by a <code className="text-muted-foreground">device_id</code> and associated with a location.
                            </>
                        }
                        actions={
                            <Button
                                variant="secondary"
                                icon={<IconPlus size={18} />}
                                iconOnly
                                rounded='full'
                                label="Close"
                                className='bg-transparent'
                                onClick={() => navigate('/hydro-devices/new-device')}
                            />
                        }
                    />
                    <DeviceList onSelect={(device) => navigate(`/hydro-devices/${device.id}`)} />
                </>
            )}

            {(isEdit || isCreate) && (
                <DeviceForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    loading={loading}
                    isEdit={isEdit}
                    fieldErrors={fieldErrors}
                />
            )}
        </div>
    );
};

export default HydroponicDevicePage;
