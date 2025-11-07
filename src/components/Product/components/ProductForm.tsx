import React, { useEffect, useState, useRef } from "react";
import Form, { FormGroup, FormLabel, FormInput, FormActions } from "../../common/Form";
import Button from "../../common/Button";
import type { Product, ProductCreate } from "../../../models/interfaces/Product";
import { useProduct } from "../../../hooks/useProduct";
import FileInput from "../../common/FileInput";
interface ProductFormProps {
    mode: "add" | "edit" | "view";
    productId?: number;
    onSuccess?: (product: Product) => void;
    onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ mode, productId, onSuccess, onCancel }) => {
    const { selectedProduct, actions, loading } = useProduct();

    const [formData, setFormData] = useState<ProductCreate>({
        name: "",
        description: "",
        base_price: 0,
        sku: "",
        is_active: true,
        image_url: "",
        variants: [],
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const isViewMode = mode === "view";

    // Load product for edit/view
    useEffect(() => {
        if ((mode === "edit" || mode === "view") && productId) {
            actions.fetchProduct(productId);
        }
    }, [mode, productId, actions]);

    // Sync form data when selected product loads
    useEffect(() => {
        if (selectedProduct && (mode === "edit" || mode === "view")) {
            setFormData({
                name: selectedProduct.name || "",
                description: selectedProduct.description || "",
                base_price: selectedProduct.base_price || 0,
                sku: selectedProduct.sku || "",
                is_active: selectedProduct.is_active ?? true,
                image_url: selectedProduct.image_url || "",
                variants: selectedProduct.variants || [],
            });
        }
    }, [selectedProduct, mode]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let product: Product;

            if (mode === "add") {
                product = await actions.createProduct(formData);
            } else if (mode === "edit" && productId) {
                product = await actions.updateProduct(productId, formData);
            } else {
                return;
            }

            // upload image if selected
            if (imageFile && product.id) {
                await actions.uploadProductImage(product.id, imageFile);
            }

            // ✅ Refresh product list automatically
            await actions.fetchProducts();

            if (onSuccess) onSuccess(product);
        } catch (err) {
            console.error("Error saving product:", err);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
            {/* --- Name --- */}
            <FormGroup>
                <FormLabel htmlFor="name">Product Name</FormLabel>
                <FormInput
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    disabled={isViewMode}
                />
            </FormGroup>

            {/* --- Description --- */}
            <FormGroup>
                <FormLabel htmlFor="description">Description</FormLabel>
                <FormInput
                    id="description"
                    type="text"
                    value={formData.description ?? ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    disabled={isViewMode}
                />

            </FormGroup>

            {/* --- Base Price --- */}
            <FormGroup>
                <FormLabel htmlFor="base_price">Base Price</FormLabel>
                <FormInput
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => handleChange("base_price", parseFloat(e.target.value) || 0)}
                    required
                    disabled={isViewMode}
                />
            </FormGroup>

            {/* --- SKU --- */}
            <FormGroup>
                <FormLabel htmlFor="sku">SKU</FormLabel>
                <FormInput
                    id="sku"
                    type="text"
                    value={formData.sku ?? ""}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    required
                    disabled={isViewMode}
                />

            </FormGroup>

            {/* --- Active Toggle --- */}
            <FormGroup>
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => handleChange("is_active", e.target.checked)}
                        disabled={isViewMode}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
            </FormGroup>

            {/* --- Image Upload --- */}
            <FormGroup>
                <FormLabel htmlFor="image">Product Image</FormLabel>

                {formData.image_url && (
                    <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border mb-2"
                    />
                )}

                {!isViewMode && (
                    <FileInput
                        id="image"
                        inputRef={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        label="Upload Image"
                    />
                )}
            </FormGroup>

            {/* --- Actions --- */}
            <FormActions className="flex justify-end gap-3">
                {onCancel && (
                    <Button
                        type="button"
                        label="Cancel"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    />
                )}

                {!isViewMode && (
                    <Button
                        type="submit"
                        label={mode === "add" ? "Create Product" : "Update Product"}
                        variant="primary"
                        disabled={loading}
                    />
                )}
            </FormActions>
        </Form>
    );
};

export default ProductForm;
