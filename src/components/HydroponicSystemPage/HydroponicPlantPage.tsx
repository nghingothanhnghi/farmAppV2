// src/components/PlantBatch/PlantBatchPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { IconPlus } from '@tabler/icons-react';
import Button from '../../components/common/Button';
import PageTitle from '../../components/common/PageTitle';
import * as Yup from 'yup';
import { useAlert } from '../../contexts/alertContext';
import { usePlantBatchContext } from '../../contexts/plantBatchContext';
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import type { PlantBatch } from '../../models/interfaces/PlantBatch';
import BatchList from './components/BatchList';
import BatchForm from './components/BatchForm';
import Modal from '../common/Modal';

const schema = Yup.object().shape({
    plant_id: Yup.number().required('Plant is required'),
    zone_id: Yup.number().required('Zone is required'),
    start_date: Yup.string().required('Start date is required'),
});

const PlantBatchPage: React.FC = () => {
    const { setAlert } = useAlert();
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const isRoot = location.pathname === '/batches';
    const isCreate = location.pathname === '/batches/new';
    const isEdit = Boolean(id);

    const {
        currentBatch,
        fetchBatch,
        createBatch,
        loading: hookLoading,
    } = usePlantBatchContext();

    const [formData, setFormData] = useState<Partial<PlantBatch>>({
        plant_id: undefined,
        zone_id: undefined,
        start_date: '',
    });

    const [formLoading, setFormLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [initialData, setInitialData] = useState<Partial<PlantBatch>>({});
    const [isDirty, setIsDirty] = useState(false);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<null | (() => void)>(null);

    // ✅ Hook MUST be after state
    const { confirmLeave } = useUnsavedChangesGuard({
        isDirty,
        onOpenModal: () => setConfirmModalOpen(true),
    });

const hasRecipeConfig = !!(currentBatch && currentBatch.current_stage_id > 0);

console.log("current_stage_id:", currentBatch?.current_stage_id);
// 👉 adjust field if different in your API
    // -----------------------------
    // Fetch batch when edit
    // -----------------------------
    useEffect(() => {
        if (isEdit && id) {
            fetchBatch(Number(id)); // ✅ no .then
        }
    }, [id, isEdit]);

    // -----------------------------
    // Sync form with currentBatch
    // -----------------------------
    useEffect(() => {
        if (isEdit && currentBatch) {
            setFormData(currentBatch);
            setInitialData(currentBatch); // 👈 snapshot
        }
    }, [currentBatch, isEdit]);

    // -----------------------------
    // Reset form when creating
    // -----------------------------
    useEffect(() => {
        if (isCreate) {
            const init = {
                plant_id: undefined,
                zone_id: undefined,
                start_date: new Date().toISOString().split('T')[0],
            };
            setFormData(init);
            setInitialData(init); // ✅ IMPORTANT FIX
            setFieldErrors({});
        }
    }, [isCreate]);

    useEffect(() => {
        setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
    }, [formData, initialData]);

    // -----------------------------
    // Cancel handler (USE HOOK)
    // -----------------------------
    const handleCancel = async () => {
        const canLeave = await confirmLeave();

        if (canLeave) {
            navigate('/batches');
        } else {
            setPendingNavigation(() => () => navigate('/batches'));
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]:
                name === 'plant_id' || name === 'zone_id'
                    ? Number(value)
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            await schema.validate(formData, { abortEarly: false });
            setFieldErrors({});

            await createBatch(formData);

            setAlert({ type: 'success', message: 'Tạo vụ trồng thành công 🌱' });
            navigate('/batches');
        } catch (err: any) {
            if (err.name === 'ValidationError') {
                const errors: Record<string, string> = {};
                err.inner.forEach((e: any) => {
                    if (e.path) errors[e.path] = e.message;
                });
                setFieldErrors(errors);
            } else {
                setAlert({ type: 'error', message: 'Có lỗi xảy ra' });
            }
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {!isRoot && (
                <PageTitle
                    title={isEdit ? 'Chi tiết vụ trồng' : 'Tạo vụ trồng'}
                    actions={
                        <Button
                            variant="secondary"
                            icon={<IconPlus size={18} />}
                            iconOnly
                            rounded='full'
                            label="Close"
                            className='bg-transparent'
                            onClick={async () => {
                                const canLeave = await confirmLeave();

                                if (canLeave) {
                                    navigate('/batches/new');
                                } else {
                                    setPendingNavigation(() => () => navigate('/batches/new'));
                                }
                            }}
                        />
                    }
                />
            )}

            {isRoot && (
                <>
                    <PageTitle
                        title="Quản lý vụ trồng"
                        subtitle={
                            <>
                                Quản lý các vụ trồng thủy canh 🌱, phân bổ vào từng khu vực và theo dõi toàn bộ quá trình sinh trưởng từ lúc gieo trồng đến khi thu hoạch.
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
                                onClick={() => navigate('/batches/new')}
                            />
                        }
                    />
                    <BatchList onSelect={(b) => navigate(`/batches/${b.id}`)} />
                </>
            )}

            {(isCreate || isEdit) && (
                <BatchForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={formLoading || hookLoading}
                    isEdit={isEdit}
                    hasRecipeConfig={hasRecipeConfig}
                    fieldErrors={fieldErrors}
                />
            )}

            <Modal
                showCloseButton={false}
                size="xsmall"
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setPendingNavigation(null);
                }}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát?
                    </div>
                }
                actions={
                    <div className="flex gap-4">
                        <Button
                            label="Rời đi"
                            variant="danger"
                onClick={() => {
    setConfirmModalOpen(false);

    if (pendingNavigation) {
        const next = pendingNavigation;
        setPendingNavigation(null); // ✅ clear BEFORE run
        next();
    }
}}
                            className="min-w-[150px]"
                            rounded="lg"
                        />
                        <Button
                            label="Ở lại"
                            variant="secondary"
                            onClick={() => {
                                setConfirmModalOpen(false);
                                setPendingNavigation(null);
                            }}
                            className="min-w-[150px]"
                            rounded="lg"
                        />
                    </div>
                }
            />

        </div>
    );
};

export default PlantBatchPage;