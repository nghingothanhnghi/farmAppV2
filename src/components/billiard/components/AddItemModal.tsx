// src/components/billiard/components/AddItemModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { IconMoodEmpty } from '@tabler/icons-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Spinner from '../../common/Spinner';
import EmptyState from '../../common/EmptyState';
import NumberInput from '../../common/NumberInput';
import { FormGroup, FormLabel, FormSelect } from '../../common/Form';
import { useProductContext } from '../../../contexts/productContext';
import { formatMoney } from '../../../utils/currency';
import type { AddItemPayload } from '../../../models/interfaces/Billiard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  busy: boolean;
  onSubmit: (payload: AddItemPayload) => Promise<boolean>;
}

const AddItemModal: React.FC<Props> = ({ isOpen, onClose, busy, onSubmit }) => {
  // Existing products API (ProductProvider is mounted in main.tsx)
  const { products, loading, error, actions } = useProductContext();
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setProductId('');
      setVariantId('');
      setQuantity(1);
    }
  }, [isOpen]);

  const activeProducts = useMemo(() => products.filter((p) => p.is_active !== false), [products]);
  const product = activeProducts.find((p) => String(p.id) === productId);
  const variants = (product?.variants ?? []).filter((v) => v.id != null);

  const handleSubmit = async () => {
    if (!productId || quantity < 1) return;
    const ok = await onSubmit({
      product_id: Number(productId),
      ...(variantId ? { variant_id: Number(variantId) } : {}),
      quantity,
    });
    if (ok) onClose();
  };

  let body: React.ReactNode;
  if (loading && products.length === 0) {
    body = <div className="flex justify-center py-8"><Spinner size={28} /></div>;
  } else if (error && products.length === 0) {
    body = (
      <div className="text-center space-y-3 py-4">
        <p className="text-sm text-red-500">{error}</p>
        <Button label="Retry" variant="secondary" size="sm" rounded="lg" onClick={() => actions.fetchProducts()} />
      </div>
    );
  } else if (activeProducts.length === 0) {
    body = <EmptyState icon={<IconMoodEmpty size={48} />} message="No products available." />;
  } else {
    body = (
      <div className="space-y-4">
        <FormGroup className="space-y-1">
          <FormLabel htmlFor="item_product">Product</FormLabel>
          <FormSelect
            id="item_product"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setVariantId('');
            }}
            className="w-full"
          >
            <option value="">Select a product</option>
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatMoney(p.base_price)}
              </option>
            ))}
          </FormSelect>
        </FormGroup>

        {variants.length > 0 && (
          <FormGroup className="space-y-1">
            <FormLabel htmlFor="item_variant">Variant (optional)</FormLabel>
            <FormSelect id="item_variant" value={variantId} onChange={(e) => setVariantId(e.target.value)} className="w-full">
              <option value="">No variant</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {formatMoney(v.price)}
                </option>
              ))}
            </FormSelect>
          </FormGroup>
        )}

        <FormGroup className="space-y-1">
          <FormLabel htmlFor="item_qty">Quantity</FormLabel>
          <NumberInput id="item_qty" value={quantity} onChange={setQuantity} min={1} max={999} />
        </FormGroup>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => {} : onClose}
      title="Add item"
      size="small"
      content={<div className="px-10 pb-4">{body}</div>}
      actions={
        <div className="flex gap-4">
          <Button
            label={busy ? 'Adding...' : 'Add'}
            onClick={handleSubmit}
            disabled={busy || !productId || quantity < 1}
            className="min-w-[150px]"
            rounded="lg"
          />
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={busy} className="min-w-[150px]" rounded="lg" />
        </div>
      }
    />
  );
};

export default AddItemModal;
