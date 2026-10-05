// src/components/billiard/components/PayModal.tsx
import React, { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { FormRadio } from '../../common/Form';
import { formatMoneyString, getBillState } from '../../../utils/billiard';
import type { BillResponse, PayResponse, PaymentMethod } from '../../../models/interfaces/Billiard';

interface StripeCheckoutProps {
  clientSecret: string;
  onSuccess: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bill: BillResponse;
  busy: boolean;
  onPay: (method: PaymentMethod) => Promise<PayResponse | null>;
  onConfirm: () => Promise<BillResponse | null>;
  onSettled: (bill: BillResponse) => void;
  /** Plug in the app's existing Stripe component here; it must call onSuccess once paid. */
  StripeCheckout?: React.ComponentType<StripeCheckoutProps>;
}

const METHODS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: 'cash', label: 'Cash', hint: 'Collected at the counter' },
  { value: 'bank_transfer', label: 'Bank transfer', hint: 'Customer transfers to the shop account' },
  { value: 'stripe', label: 'Card (Stripe)', hint: 'Pay online by card' },
];

const PayModal: React.FC<Props> = ({ isOpen, onClose, bill, busy, onPay, onConfirm, onSettled, StripeCheckout }) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setClientSecret(null);
    }
  }, [isOpen]);

  const handlePay = async () => {
    const res = await onPay(method); // only the method is sent; backend uses grand_total
    if (!res) return;
    const secret = res.gateway?.client_secret;
    if (method === 'stripe' && secret && getBillState(res) !== 'paid') {
      setClientSecret(secret);
      return;
    }
    onSettled(res);
    onClose();
  };

  const handleConfirm = async () => {
    const res = await onConfirm();
    if (res) {
      onSettled(res);
      onClose();
    }
  };

  const inStripeStep = clientSecret !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => {} : onClose}
      title={`Pay ${formatMoneyString(bill.grand_total, bill.currency)}`}
      size="small"
      content={
        <div className="px-10 pb-4 space-y-4">
          {!inStripeStep ? (
            <div className="space-y-3">
              {METHODS.map((m) => (
                <div key={m.value} className="space-y-0.5">
                  <FormRadio
                    id={`pay-${m.value}`}
                    name="payment_method"
                    label={m.label}
                    checked={method === m.value}
                    onChange={() => setMethod(m.value)}
                    disabled={busy}
                  />
                  <p className="pl-7 text-[0.625rem] text-gray-500 dark:text-gray-400">{m.hint}</p>
                </div>
              ))}
            </div>
          ) : StripeCheckout ? (
            <StripeCheckout clientSecret={clientSecret} onSuccess={handleConfirm} />
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Complete the card payment, then confirm to settle the bill.
            </p>
          )}
        </div>
      }
      actions={
        <div className="flex gap-4">
          {!inStripeStep ? (
            <Button
              label={busy ? 'Processing...' : 'Pay'}
              onClick={handlePay}
              disabled={busy}
              className="min-w-[150px]"
              rounded="lg"
            />
          ) : (
            !StripeCheckout && (
              <Button
                label={busy ? 'Confirming...' : 'Confirm payment'}
                onClick={handleConfirm}
                disabled={busy}
                className="min-w-[150px]"
                rounded="lg"
              />
            )
          )}
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={busy} className="min-w-[150px]" rounded="lg" />
        </div>
      }
    />
  );
};

export default PayModal;
