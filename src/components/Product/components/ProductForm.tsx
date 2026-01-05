import React, { useEffect, useState, useRef } from "react";
import { generateSKU, generateVariantSKU } from "../../../utils/product";
import Form, { FormGroup, FormActions } from "../../common/Form";
import Button from "../../common/Button";
import type { Product, ProductCreate } from "../../../models/interfaces/Product";
import { useAlert } from '../../../contexts/alertContext';
import { useProductContext } from "../../../contexts/productContext";
import ProductInfoForm from "./ProductInfoForm";
import ProductVariantForm from "./ProductVariantForm";
interface ProductFormProps {
    mode: "add" | "edit" | "view";
    productId?: number;
    onSuccess?: (product: Product) => void;
    onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ mode, productId, onSuccess, onCancel }) => {
    const { setAlert } = useAlert();
    const { selectedProduct, actions, loading, variantSKUs } = useProductContext();

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

    // Auto-generate SKU when name changes (add mode only)
    useEffect(() => {
        if (mode === "add" && formData.name && !formData.sku) {
            setFormData(prev => ({
                ...prev,
                sku: generateSKU(prev.name)
            }));
        }
    }, [formData.name, formData.sku, mode]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let product: Product;

            if (mode === "add") {
                product = await actions.createProduct(formData);

                // Create NEW variants only
                for (const v of formData.variants || []) {
                    if (!v.name?.trim()) continue;
                    if (v.id) continue; // should not happen for add

                    // Generate SKU
                    if (!v.sku) {
                        const latestSKUs = await actions.fetchAllVariantSKUs();
                        const otherSKUs = [
                            ...(formData.variants || []).filter(x => x !== v).map(x => x.sku || ""),
                            ...latestSKUs
                        ];
                        v.sku = generateVariantSKU(product.sku!, v.name, otherSKUs);
                    }

                    const createdProduct = await actions.createVariant(product.id, v);
                    const createdVariant = createdProduct.variants.find(x => x.name === v.name && x.sku === v.sku);

                    // Upload image if present
                    if ((v as any)._file && createdVariant?.id) {
                        await actions.uploadVariantImage(createdVariant.id, (v as any)._file);
                    }
                }

                setAlert({ message: 'Product created successfully!', type: 'success' });

            } else if (mode === "edit" && productId) {
                product = await actions.updateProduct(productId, formData);

                for (const v of formData.variants || []) {
                    if (v.id) {
                        // Existing variant → check for changes
                        const original = selectedProduct?.variants.find(x => x.id === v.id);
                        const hasChanged =
                            v.name !== original?.name ||
                            v.price !== original?.price ||
                            v.stock !== original?.stock ||
                            JSON.stringify(v.attributes) !== JSON.stringify(original?.attributes) ||
                            (v as any)._file;

                        if (hasChanged) {
                            await actions.updateVariant(v.id, v);

                            // Upload image if changed
                            if ((v as any)._file) {
                                await actions.uploadVariantImage(v.id, (v as any)._file);
                            }
                        }

                        continue;
                    }

                    // New variant → create
                    if (!v.sku) {
                        const otherSKUs = [
                            ...(formData.variants || []).filter(x => x !== v).map(x => x.sku || ""),
                            ...variantSKUs
                        ];
                        v.sku = generateVariantSKU(product.sku!, v.name, otherSKUs);
                    }

                    const created = await actions.createVariant(productId, v);
                    if ((v as any)._file && created.variants[0].id) {
                        await actions.uploadVariantImage(created.variants[0].id, (v as any)._file);
                    }
                }

                setAlert({ message: 'Product updated successfully!', type: 'success' });

            } else {
                return;
            }

            // Upload product image
            if (imageFile && product.id) {
                await actions.uploadProductImage(product.id, imageFile);
            }

            // Refresh
            await actions.fetchProducts();
            await actions.fetchAllVariantSKUs();

            if (onSuccess) onSuccess(product);

        } catch (err) {
            console.error("Error saving product:", err);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto pb-20 px-4">
            <ProductInfoForm
                data={formData}
                isViewMode={isViewMode}
                onChange={handleChange}
                onImageChange={setImageFile}
            />

            {/* Variants */}
            <FormGroup className="grid gap-4">
                {(formData.variants || []).map((variant, idx) => (
                    <ProductVariantForm
                        key={variant.id || idx}
                        variant={variant}
                        productSKU={formData.sku || ""} // <-- pass parent SKU
                        existingSKUs={(formData.variants || [])
                            .filter((_, i) => i !== idx)
                            .map(v => v.sku || "")
                            .filter(Boolean)}
                        variantSKUs={variantSKUs}
                        onSave={(v, file) => {
                            if (file) (v as any)._file = file;
                            setFormData(prev => {
                                const variants = [...(prev.variants || [])];
                                const index = variants.findIndex(x => x.id === v.id);
                                if (index > -1) variants[index] = v;
                                else variants.push(v);
                                return { ...prev, variants };
                            });
                        }}
                        onDelete={() => {
                            setFormData((prev) => ({
                                ...prev,
                                variants: (prev.variants || []).filter((x) => x !== variant),
                            }));
                        }}
                        disabled={isViewMode}
                    />
                ))}

                {!isViewMode && (
                    <Button
                        label="Add Variant"
                        variant="secondary"
                        onClick={() =>
                            setFormData((prev) => ({
                                ...prev,
                                variants: [...(prev.variants || []),
                                {
                                    name: "",
                                    price: 0,
                                    sku: "", // start empty → auto-generate when typing name
                                },
                                ],
                            }))
                        }
                    />
                )}
            </FormGroup>

            {/* --- Actions --- */}
            <FormActions className="flex justify-end gap-3 absolute bottom-0 right-0 w-full bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700">
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
