// src/components/billiard/components/TableFormModal.tsx
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { FormGroup, FormInput, FormLabel } from '../../common/Form';
import type { TableCreate } from '../../../models/interfaces/Billiard';
import type { CreateTableError } from '../../../hooks/useTables';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  onSubmit: (data: TableCreate) => Promise<true | CreateTableError>;
}

const schema = Yup.object({
  name: Yup.string().trim().required('Name is required').min(2, 'Too short'),
  hourly_rate: Yup.string()
    .trim()
    .required('Hourly rate is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (e.g. 60000)')
    .test('positive', 'Must be greater than 0', (v) => !!v && /[1-9]/.test(v)),
});

const TableFormModal: React.FC<Props> = ({ isOpen, onClose, loading, onSubmit }) => {
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setName('');
      setRate('');
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      await schema.validate({ name, hourly_rate: rate }, { abortEarly: false });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const e: Record<string, string> = {};
        err.inner.forEach((x) => x.path && !e[x.path] && (e[x.path] = x.message));
        setErrors(e);
      }
      return;
    }
    setErrors({});
    // hourly_rate stays a string - no float conversion
    const res = await onSubmit({ name: name.trim(), hourly_rate: rate.trim() });
    if (res === true) onClose();
    else if (res.status === 409) setErrors({ name: res.message });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title="New Table"
      size="small"
      content={
        <div className="px-10 pb-4 space-y-4">
          <FormGroup className="space-y-1">
            <FormLabel htmlFor="table_name">Name</FormLabel>
            <FormInput id="table_name" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </FormGroup>
          <FormGroup className="space-y-1">
            <FormLabel htmlFor="table_rate">Hourly rate (VND)</FormLabel>
            <FormInput
              id="table_rate"
              type="text"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              disabled={loading}
            />
            {errors.hourly_rate && <p className="text-red-500 text-xs">{errors.hourly_rate}</p>}
          </FormGroup>
        </div>
      }
      actions={
        <div className="flex gap-4">
          <Button
            label={loading ? 'Saving...' : 'Create'}
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[150px]"
            rounded="lg"
          />
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={loading} className="min-w-[150px]" rounded="lg" />
        </div>
      }
    />
  );
};

export default TableFormModal;
