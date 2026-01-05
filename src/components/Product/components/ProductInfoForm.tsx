import React, { useRef } from "react";
import { FormGroup, FormLabel, FormInput, FormCheckbox } from "../../common/Form";
import FileInput from "../../common/FileInput";
import type { ProductCreate } from "../../../models/interfaces/Product";

interface ProductInfoFormProps {
  data: ProductCreate;
  isViewMode: boolean;
  onChange: (field: keyof ProductCreate, value: any) => void;
  onImageChange: (file: File | null) => void;
}

const ProductInfoForm: React.FC<ProductInfoFormProps> = ({
  data,
  isViewMode,
  onChange,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      {/* Name + Active */}
      <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <FormLabel htmlFor="name">Product Name</FormLabel>
        <div className="space-y-3">
          <FormInput
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            disabled={isViewMode}
            required
          />
          <FormCheckbox
            id="is_active"
            label="Active"
            checked={data.is_active ?? false}
            onChange={(e) => onChange("is_active", e.target.checked)}
            disabled={isViewMode}
          />
        </div>
      </FormGroup>

      {/* SKU */}
      <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <FormLabel htmlFor="sku">SKU</FormLabel>
        <FormInput
          id="sku"
          type="text"
          value={data.sku ?? ""}
          onChange={(e) => onChange("sku", e.target.value)}
          disabled={isViewMode}
          required
        />
      </FormGroup>

      {/* Description */}
      <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <FormLabel htmlFor="description">Description</FormLabel>
        <FormInput
          id="description"
          type="text"
          value={data.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          disabled={isViewMode}
        />
      </FormGroup>

      {/* Base Price */}
      <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <FormLabel htmlFor="base_price">Base Price</FormLabel>
        <FormInput
          id="base_price"
          type="number"
          step="0.01"
          value={data.base_price}
          onChange={(e) => onChange("base_price", parseFloat(e.target.value) || 0)}
          disabled={isViewMode}
          required
        />
      </FormGroup>

      {/* Image */}
      <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className='space-y-1'>
          <FormLabel htmlFor="image">Product Image</FormLabel>
        </div>
        <div>
          {data.image_url && (
            <img
              src={data.image_url}
              className="w-32 h-32 object-cover rounded border mb-2"
            />
          )}
          {!isViewMode && (
            <FileInput
              id="image"
              inputRef={fileInputRef}
              accept="image/*"
              label="Upload Image"
              onChange={(e) =>
                onImageChange(e.target.files?.[0] || null)
              }
            />
          )}
        </div>
      </FormGroup>
    </>
  );
};

export default ProductInfoForm;
