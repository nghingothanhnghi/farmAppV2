// src/components/Hydro/HydroponicDevicePage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { IconPlus } from '@tabler/icons-react';
import Button from '../../components/common/Button';
import PageTitle from '../../components/common/PageTitle';
import * as Yup from 'yup';
import { useAlert } from '../../contexts/alertContext';
import { useHydroDevices } from '../../hooks/useHydroDevices';
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

    // -----------------------------
    // Hook data
    // -----------------------------
    const {
        devices,
        createDevice,
        updateDevice,
        refreshDevice,
        fetchDevices, // optional if you want to refresh list after create
        loading: hookLoading,
    } = useHydroDevices();

    const [formData, setFormData] = useState<Partial<HydroDevice>>({
        name: '',
        device_id: '',
        location: '',
        type: '',
    });

    const [formLoading, setFormLoading] = useState(false); // avoid collision with hook loading
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // If editing, try to populate formData from hook cache first.
    useEffect(() => {
        let mounted = true;

        const loadForEdit = async () => {
            if (!isEdit || !id) return;

            // try to find device in hook cache
            const cached = devices.find(d => d.id === Number(id));
            if (cached && mounted) {
                setFormData(cached);
                return;
            }

            // not in cache — refresh from server via hook, then pick up from devices array
            try {
                await refreshDevice(Number(id)); // refreshDevice updates hook's devices
                // after refresh, try to find the device in hook cache again
                const refreshed = devices.find(d => d.id === Number(id));
                if (refreshed && mounted) {
                    setFormData(refreshed);
                }
            } catch (err) {
                // fallback: show a user-friendly error
                setAlert({ type: 'error', message: 'Failed to fetch device data' });
            }
        };

        if (isEdit) loadForEdit();
        else if (isCreate) {
            // reset form for create
            setFormData({
                name: '',
                device_id: '',
                location: '',
                type: '',
            });
            setFieldErrors({});
        }

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEdit, isCreate]); // we intentionally don't include `devices` to avoid re-running too often

    // Keep form in sync if devices change (e.g., after refreshDevice finishes)
    useEffect(() => {
        if (isEdit && id) {
            const cached = devices.find(d => d.id === Number(id));
            if (cached) setFormData(cached);
        }
    }, [devices, id, isEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            await deviceSchema.validate(formData, { abortEarly: false });
            setFieldErrors({});

            if (isEdit && id) {
                await updateDevice(Number(id), formData);
                setAlert({ message: 'Device updated successfully!', type: 'success' });
            } else {
                await createDevice(formData);
                setAlert({ message: 'Device created successfully!', type: 'success' });
            }

            // Optionally refresh the full device list (if your hook doesn't auto-add)
            if (fetchDevices) await fetchDevices();

            navigate('/hydro-devices');
        } catch (err: any) {
            if (err && err.name === 'ValidationError') {
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
            setFormLoading(false);
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
                    loading={formLoading || hookLoading}
                    isEdit={isEdit}
                    fieldErrors={fieldErrors}
                />
            )}
        </div>
    );
};

export default HydroponicDevicePage;
