import React, { useState, useRef, useEffect } from "react";
import type { ProductVariant } from "../../../models/interfaces/Product";
import Button from "../../common/Button";
import { generateVariantSKU } from "../../../utils/product";
import { FormInput } from "../../common/Form";
import FileInput from "../../common/FileInput";
import { IconTrash } from "@tabler/icons-react";

interface ProductVariantFormProps {
  variant?: ProductVariant; // optional for edit/add
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

  // Auto-generate SKU
  useEffect(() => {
    if (variant?.id) return; // existing variant keeps SKU
    if (!formData.name) return;

    const allSKUs = [...existingSKUs, ...variantSKUs].filter(s => s !== formData.sku);
    const sku = generateVariantSKU(productSKU, formData.name, allSKUs);

    setFormData(prev => ({ ...prev, sku }));
  }, [formData.name, productSKU, existingSKUs, variantSKUs, variant?.id]);


  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Variant name cannot be empty.");
      return;
    }

    if (!formData.sku?.trim()) {
      alert("Variant SKU cannot be empty. Please type a name to generate SKU.");
      return;
    }

    onSave(formData, file || undefined); // only update local state
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

      {formData.image_url && (
        <img
          src={formData.image_url}
          alt="Variant Preview"
          className="w-20 h-20 object-cover rounded mb-2"
        />
      )}

      {!disabled && (
        <FileInput
          id={`variant-image-${formData.id || Math.random()}`}
          inputRef={inputRef}
          onChange={handleFileChange}
          accept="image/*"
          label="Upload Image"
        />
      )}

      {!disabled && (
        <div className="flex justify-end mt-2">
          <Button
            label="Save Variant"
            onClick={handleSave}
          />
        </div>
      )}
    </div>
  );
};

export default ProductVariantForm;
