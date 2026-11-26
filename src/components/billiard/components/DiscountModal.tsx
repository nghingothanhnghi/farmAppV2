
// src/components/billiard/components/DiscountModal.tsx

import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import {
    FormGroup,
    FloatingLabelInput,
    FloatingLabelTextarea,
} from '../../common/Form';
import {
    discountSchema,
    type DiscountFormValues,
} from '../../../validation/discountValidation';

interface DiscountData {
    amount?: number;
    percent?: number;
    reason?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    busy: boolean;
    onSubmit: (data: DiscountData) => Promise<unknown>;
}


const DiscountModal: React.FC<Props> = ({
    isOpen,
    onClose,
    busy,
    onSubmit,
}) => {
    const [amount, setAmount] = useState('');
    const [percent, setPercent] = useState('');
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset the form whenever the modal opens.
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setPercent('');
            setReason('');
            setErrors({});
        }
    }, [isOpen]);

    //   const handleSubmit = async () => {
    //     try {
    //       await schema.validate(
    //         { amount, percent, reason },
    //         { abortEarly: false },
    //       );
    //     } catch (err) {
    //       if (err instanceof Yup.ValidationError) {
    //         const validationErrors: Record<string, string> = {};

    //         err.inner.forEach((item) => {
    //           if (item.path && !validationErrors[item.path]) {
    //             validationErrors[item.path] = item.message;
    //           }
    //         });

    //         setErrors(validationErrors);
    //       }

    //       return;
    //     }

    //     setErrors({});

    //     const result = await onSubmit({
    //       amount: amount === '' ? undefined : Number(amount),
    //       percent: percent === '' ? undefined : Number(percent),
    //       reason: reason.trim(),
    //     });

    //     if (result) {
    //       onClose();
    //     }
    //   };

    const handleSubmit = async () => {
        const values: DiscountFormValues = {
            amount,
            percent,
            reason,
        };

        try {
            await discountSchema.validate(values, {
                abortEarly: false,
            });
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const validationErrors: Record<string, string> = {};

                err.inner.forEach((item) => {
                    if (item.path && !validationErrors[item.path]) {
                        validationErrors[item.path] = item.message;
                    }
                });

                setErrors(validationErrors);
            }

            return;
        }

        setErrors({});

        const payload: DiscountData = {
            amount: amount === '' ? undefined : Number(amount),
            percent: percent === '' ? undefined : Number(percent),
            reason: reason.trim(),
        };

        const result = await onSubmit(payload);

        if (result) {
            onClose();
        }
    };

    const handleAmountChange = (value: string) => {
        const sanitized = value.replace(/\D/g, '');

        setAmount(sanitized);

        if (sanitized) {
            setPercent('');
        }

        setErrors((prev) => ({
            ...prev,
            amount: '',
            percent: '',
        }));
    };

    const handlePercentChange = (value: string) => {
        setPercent(value);

        if (value) {
            setAmount('');
        }

        setErrors((prev) => ({
            ...prev,
            amount: '',
            percent: '',
        }));
    };

    return (
        <Modal
            showCloseButton={false}
            size="xsmall"
            isOpen={isOpen}
            onClose={busy ? () => { } : onClose}
            title="Apply discount"
            content={
                <div className="space-y-3 px-6 py-5 text-sm">
                    <p>
                        Enter an amount or percent, not both. A reason is required for a
                        non-zero discount. Enter amount 0 to remove it.
                    </p>

                    {/* Discount amount */}
                    <FormGroup className="space-y-1">
                        <FloatingLabelInput
                            id="discount-amount"
                            name="discount-amount"
                            type="text"
                            inputMode="numeric"
                            label="Discount amount (VND)"
                            placeholder="Enter discount amount"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            alwaysFloat
                            disabled={busy}
                            className="w-full"
                        />

                        {errors.amount && (
                            <p className="text-xs text-red-500">
                                {errors.amount}
                            </p>
                        )}
                    </FormGroup>

                    {/* Discount percentage */}
                    <FormGroup className="space-y-1">
                        <FloatingLabelInput
                            id="discount-percent"
                            name="discount-percent"
                            type="text"
                            inputMode="decimal"
                            label="Discount percentage (%)"
                            placeholder="Enter percentage"
                            value={percent}
                            onChange={(e) => handlePercentChange(e.target.value)}
                            alwaysFloat
                            disabled={busy}
                            className="w-full"
                        />

                        {errors.percent && (
                            <p className="text-xs text-red-500">
                                {errors.percent}
                            </p>
                        )}
                    </FormGroup>

                    {/* Required reason */}
                    <FormGroup className="space-y-1">
                        <FloatingLabelTextarea
                            id="discount-reason"
                            label="Discount reason"
                            placeholder="Enter reason for discount"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setErrors((prev) => ({
                                    ...prev,
                                    reason: '',
                                }));
                            }}
                            rows={3}
                            alwaysFloat
                            disabled={busy}
                            className="w-full"
                        />

                        {errors.reason && (
                            <p className="text-xs text-red-500">
                                {errors.reason}
                            </p>
                        )}
                    </FormGroup>

                </div>
            }
            actions={
                <div className="flex gap-3">
                    <Button
                        label={busy ? 'Saving...' : 'Save discount'}
                        rounded="lg"
                        disabled={busy || (!amount && !percent)}
                        onClick={handleSubmit}
                    />

                    <Button
                        label="Cancel"
                        variant="secondary"
                        rounded="lg"
                        disabled={busy}
                        onClick={onClose}
                    />
                </div>
            }
        />
    );
};

export default DiscountModal;
