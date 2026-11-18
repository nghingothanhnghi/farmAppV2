// src/components/billiard/components/TableFormModal.tsx
import React, { useEffect, useState } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import InlineNotice from '../../common/InlineNotice';
import { FormGroup, FloatingLabelInput } from '../../common/Form';
import type {
  BilliardTable,
  TableCreate,
} from '../../../models/interfaces/Billiard';
import type { CreateTableError } from '../../../hooks/useTables';
import { formatNumber } from '../../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  table?: BilliardTable | null;
  onSubmit: (data: TableCreate) => Promise<true | CreateTableError>;
}

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Name is required')
    .min(2, 'Too short'),
  hourly_rate: Yup.string()
    .trim()
    .required('Hourly rate is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (e.g. 60000)')
    .test('positive', 'Must be greater than 0', (v) => !!v && /[1-9]/.test(v)),
});

const TableFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  loading,
  table,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!table;
  const isPlaying = table?.status === 'playing';

  useEffect(() => {
    if (isOpen) {
      setName(table?.name ?? '');
      setRate(table?.hourly_rate ?? '');
      setErrors({});
    }
  }, [isOpen, table?.id]);

  const handleSubmit = async () => {
    try {
      await schema.validate(
        { name, hourly_rate: rate },
        { abortEarly: false },
      );
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const e: Record<string, string> = {};

        err.inner.forEach((x) => {
          if (x.path && !e[x.path]) {
            e[x.path] = x.message;
          }
        });

        setErrors(e);
      }

      return;
    }

    setErrors({});

    // Keep money as a string. No float conversion.
    const res = await onSubmit({
      name: name.trim(),
      hourly_rate: rate.trim(),
    });

    if (res === true) {
      onClose();
    } else if (res.status === 409) {
      setErrors({ name: res.message });
    }
  };



  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => { } : onClose}
      title={
        isEditing
          ? t('billiard_tables.modals.table.edit_title', {
            defaultValue: 'Edit table',
          })
          : t('billiard_tables.modals.table.title')
      }
      size="small"
      position="bottom"
      content={
        <div className="px-7 pb-4 space-y-4 min-h-[200px]">
          <FormGroup className="space-y-1">
            <FloatingLabelInput
              id="table_name"
              name="table_name"
              type="text"
              label={t('input.table_name.label')}
              value={name}
              placeholder={t('input.table_name.placeholder')}
              alwaysFloat
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />

            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}
          </FormGroup>

          <FormGroup className="space-y-1">
            <FloatingLabelInput
              id="table_rate"
              name="table_rate"
              type="text"
              inputMode="decimal"
              label={t('input.hourly_rate.label')}
              value={
                rate
                  ? formatNumber(Number(rate), '', 0, 'vi-VN')
                  : ''
              }
              placeholder={t('input.hourly_rate.placeholder')}
              alwaysFloat
              onChange={(e) => {
                setRate(e.target.value.replace(/\D/g, ''));
              }}
              disabled={loading}
              required
            />

            {errors.hourly_rate && (
              <p className="text-red-500 text-xs">
                {errors.hourly_rate}
              </p>
            )}
          </FormGroup>

          {isPlaying && (
            <InlineNotice
              variant="info"
            >
              <div className="flex gap-2">
                <IconInfoCircle />
                <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
                  Changing the hourly rate only affects future sessions.
                  The current session keeps its original pricing.
                </p>
              </div>
            </InlineNotice>
          )}
        </div>
      }
      actions={
        <div className="flex gap-4">
          <Button
            label={
              loading
                ? t('btn.saving')
                : isEditing
                  ? t('btn.update')
                  : t('btn.save')
            }
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[150px]"
            rounded="lg"
          />

          <Button
            label={t('btn.cancel')}
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="min-w-[150px]"
            rounded="lg"
          />
        </div>
      }
    />
  );
};

export default TableFormModal;
