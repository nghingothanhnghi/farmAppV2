import React, { useState, useRef, useEffect } from "react";
import type { ProductVariant } from "../../../models/interfaces/Product";
import Button from "../../common/Button";
import { generateVariantSKU } from "../../../utils/product";
import { FormInput } from "../../common/Form";
import FileInput from "../../common/FileInput";
import { IconTrash } from "@tabler/icons-react";

interface ProductVariantFormProps {
  variant?: ProductVariant & { _draftId?: string; saved?: boolean }; // optional for edit/add
  productSKU: string;           // <-- added
  existingSKUs: string[];
  variantSKUs: string[];
  onSave: (variant: ProductVariant, file?: File) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  variant,
  productSKU,
  existingSKUs,
  variantSKUs,
  onSave,
  onDelete,
  disabled = false,
}) => {
  const [formData, setFormData] = useState<ProductVariant>({
    name: variant?.name || "",
    sku: variant?.sku || "",
    price: variant?.price || 0,
    stock: variant?.stock || 0,
    attributes: variant?.attributes || {},
    image_url: variant?.image_url,
    id: variant?.id,
  });

  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ✅ SAFE DERIVED VALUES
  const draftId = (variant as any)?._draftId;
  const isSaved = (variant as any)?.saved === true;
  const variantId = variant?.id;

  // 🔹 Auto-generate SKU for NEW (draft) variants
  useEffect(() => {
    if (variantId) return;
    if (!formData.name) return;

    const currentSku = formData.sku ?? "";

    const allSKUs = [...existingSKUs, ...variantSKUs].filter(
      s => s !== currentSku
    );

    const sku = generateVariantSKU(productSKU, formData.name, allSKUs);
    setFormData(prev => ({ ...prev, sku }));
  }, [formData.name, productSKU, existingSKUs, variantSKUs, variantId]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const f = e.target.files?.[0];
  if (!f) return;

  setFile(f);

  // 🔹 Create local preview URL
  const previewUrl = URL.createObjectURL(f);

  setFormData(prev => ({
    ...prev,
    image_url: previewUrl, // 👈 this is the missing link
  }));
};


  const handleSave = () => {
    const name = formData.name?.trim() ?? "";
    const sku = formData.sku?.trim() ?? "";

    if (!name) {
      alert("Variant name cannot be empty.");
      return;
    }

    if (!sku) {
      alert("Variant SKU cannot be empty.");
      return;
    }

    onSave(
      {
        ...formData,
        saved: true,
        _draftId: draftId,
      } as any,
      file || undefined
    );
  };


  return (
    <div className="border p-4 rounded mb-3">
      <div className="flex items-center justify-between mb-2">
        <FormInput
          id="variantName"
          type="text"
          placeholder="Variant Name"
          value={formData.name ?? ""}
          onChange={(e) => handleChange("name", e.target.value)}
          className="min-w-[100px]"
          required
          disabled={disabled}
        />
        <FormInput
          id="variantSku"
          type="text"
          placeholder="SKU"
          value={formData.sku ?? ""}
          onChange={(e) => handleChange("sku", e.target.value)}
          className="min-w-[100px]"
          required
          disabled={disabled}
        />
        <FormInput
          id="variantPrice"
          type="number"
          placeholder="Price"
          value={formData.price ?? ""}
          onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
          className="min-w-[100px]"
          required
          disabled={disabled}
        />
        {onDelete && (
          <Button
            icon={<IconTrash size={16} />}
            iconOnly
            variant="secondary"
            onClick={onDelete}
            disabled={disabled}
            rounded="full"
          />
        )}
      </div>
      {/* 🔶 Unsaved changes warning */}
      {!isSaved && !disabled && (
        <p className="text-xs text-orange-500">
          ⚠ Unsaved changes
        </p>
      )}
      {formData.image_url && (
        <img
          src={formData.image_url}
          alt="Variant Preview"
          className="w-20 h-20 object-cover rounded mb-2"
        />
      )}

      {!disabled && (
        <FileInput
          id={`variant-image-${formData.id || (variant as any)?._draftId}`}
          inputRef={inputRef}
          onChange={handleFileChange}
          accept="image/*"
          label="Upload Image"
        />
      )}

      {!disabled && (
        <div className="flex justify-end mt-2">
          <Button
            label={isSaved ? "Saved" : "Save Variant"}
            onClick={handleSave}
            variant={isSaved ? "secondary" : "primary"}
          />
        </div>
      )}
    </div>
  );
};

export default ProductVariantForm;
