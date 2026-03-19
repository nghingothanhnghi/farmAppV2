import React, { useRef } from "react";
import { FormGroup, FormLabel, FormInput, FormCheckbox } from "../../common/Form";
import FileInput from "../../common/FileInput";
import RichTextEditor from "../../common/RichTextEditor";
import QRCodeImage from "../../common/QRCodeImage";
import ProductImage from "../../common/ProductImage";
import type { ProductCreate } from "../../../models/interfaces/Product";

interface ProductInfoFormProps {
  data: ProductCreate;
  isViewMode: boolean;
  onChange: (field: keyof ProductCreate, value: any) => void;
  onImageChange: (file: File | null) => void;

  qrCodeUrl?: string;
  onRegenerateQr?: () => void;
  mode: "add" | "edit" | "view";
}

const ProductInfoForm: React.FC<ProductInfoFormProps> = ({
  data,
  isViewMode,
  onChange,
  onImageChange,

  qrCodeUrl,
  onRegenerateQr,
  mode
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      {/* Name + Active */}
      <FormGroup className="grid gap-x-8 gap-y-2 lg:gap-y-6 sm:grid-cols-2">
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
      <FormGroup className="grid gap-x-8 gap-y-2 lg:gap-y-6 sm:grid-cols-2">
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
      <FormGroup className="grid gap-x-8 gap-y-2 lg:gap-y-6 sm:grid-cols-2">
        <FormLabel htmlFor="description">Description</FormLabel>
        {/* <FormInput
          id="description"
          type="text"
          value={data.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          disabled={isViewMode}
        /> */}

        <RichTextEditor
          value={data.description || ""}
          onChange={(html) => onChange("description", html)}
          toolbar={{
            image: false,
            heading: false,
            bulletList: false,
            orderedList: false,
            strike: false,
          }}
          readOnly={isViewMode}
        />
      </FormGroup>

      {/* Base Price */}
      <FormGroup className="grid gap-x-8 gap-y-2 lg:gap-y-6 sm:grid-cols-2">
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
      <FormGroup className="grid gap-x-8 gap-y-2 lg:gap-y-6 sm:grid-cols-2">
        <div className='space-y-1'>
          <FormLabel htmlFor="image">Product Image</FormLabel>
        </div>
        <div className="space-y-1">
          <div className="aspect-square w-full lg:w-[255px] bg-gray-100 dark:bg-gray-950 flex items-center justify-center overflow-hidden rounded-lg">
            {data.image_url ? (
              <ProductImage
                imageUrl={data.image_url}
                alt={data.name}
                size={200} // width/height of the card image
                rounded="lg"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <span className="text-gray-400 text-sm">No Image</span>
            )}
          </div>
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
      {/* QR Code */}
      {mode !== "add" && (
        <FormGroup className="grid gap-x-8 gap-y-2 lg:gap-y-6 sm:grid-cols-2">
          <div className='space-y-1'>
            <FormLabel htmlFor="">QR Code</FormLabel>
          </div>
          <div className="flex items-center gap-3">
            <QRCodeImage
              imageUrl={qrCodeUrl}
              size={64}
              rounded="md"
              border
            />

            {!isViewMode && (
              <button
                type="button"
                onClick={onRegenerateQr}
                className="text-sm text-blue-600 hover:underline"
              >
                Regenerate QR Code
              </button>
            )}
          </div>
        </FormGroup>
      )}
    </>
  );
};

export default ProductInfoForm;
