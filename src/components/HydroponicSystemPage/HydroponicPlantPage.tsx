// src/components/PlantBatch/PlantBatchPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { IconPlus } from '@tabler/icons-react';
import Button from '../../components/common/Button';
import PageTitle from '../../components/common/PageTitle';
import * as Yup from 'yup';
import { useAlert } from '../../contexts/alertContext';
import { usePlantBatchContext } from '../../contexts/plantBatchContext';
import type { PlantBatch } from '../../models/interfaces/PlantBatch';
import BatchList from './components/BatchList';
import BatchForm from './components/BatchForm';

const schema = Yup.object().shape({
  plant_id: Yup.number().required('Plant is required'),
  zone_id: Yup.number().required('Zone is required'),
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
    batches,
    currentBatch,
    fetchBatch,
    createBatch,
    loading: hookLoading,
  } = usePlantBatchContext();

  const [formData, setFormData] = useState<any>({
    plant_id: '',
    zone_id: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // -----------------------------
  // Load edit data
  // -----------------------------
  useEffect(() => {
    if (isEdit && id) {
      fetchBatch(Number(id)).then((data) => {
        if (data) setFormData(data);
      });
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
              icon={<IconPlus size={18} />}
              onClick={() => navigate('/batches/new')}
            />
          }
        />
      )}

      {isRoot && (
        <>
          <PageTitle
            title="🌱 Quản lý vụ trồng"
            actions={
              <Button
                icon={<IconPlus size={18} />}
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
          loading={formLoading || hookLoading}
          isEdit={isEdit}
          fieldErrors={fieldErrors}
        />
      )}
    </div>
  );
};

export default PlantBatchPage;