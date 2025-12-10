import React, { useState, useRef } from "react";
import type{ ProductVariant } from "../../../models/interfaces/Product";
import Button from "../../common/Button";
import FileInput from "../../common/FileInput";
import { IconTrash } from "@tabler/icons-react";

interface ProductVariantFormProps {
  variant?: ProductVariant; // optional for edit/add
  onSave: (variant: ProductVariant, file?: File) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  variant,
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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSave = () => {
    onSave(formData, file || undefined);
  };

  return (
    <div className="border p-4 rounded mb-3">
      <div className="flex items-center justify-between mb-2">
        <input
          type="text"
          placeholder="Variant Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          disabled={disabled}
          className="border rounded px-2 py-1 flex-1 mr-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
          disabled={disabled}
          className="border rounded px-2 py-1 w-24 mr-2"
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
          <Button label="Save Variant" onClick={handleSave} />
        </div>
      )}
    </div>
  );
};

export default ProductVariantForm;
