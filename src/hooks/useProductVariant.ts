// src/hooks/useProductVariant.ts
import { useState, useCallback } from "react";
import { productService } from "../services/productService";
import type { Product, ProductVariant } from "../models/interfaces/Product";

export const useProductVariant = (productId: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch latest product (with variants)
  const refreshProduct = useCallback(async () => {
    setLoading(true);
    try {
      const updated = await productService.getById(productId);
      setProduct(updated);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load product variants");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // ✅ Add new variant
  const addVariant = useCallback(
    async (variant: ProductVariant) => {
      setLoading(true);
      try {
        const updated = await productService.createVariant(productId, variant);
        setProduct(updated);
        return updated;
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to create variant");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [productId]
  );

  // ✅ Update variant
  const updateVariant = useCallback(async (variantId: number, data: Partial<ProductVariant>) => {
    setLoading(true);
    try {
      const updated = await productService.updateVariant(variantId, data);
      setProduct(updated);
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update variant");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Delete variant
  const deleteVariant = useCallback(async (variantId: number) => {
    setLoading(true);
    try {
      await productService.deleteVariant(variantId);
      await refreshProduct();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete variant");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshProduct]);

  // ✅ Upload variant image
  const uploadVariantImage = useCallback(async (variantId: number, file: File) => {
    setLoading(true);
    try {
      const updated = await productService.uploadVariantImage(variantId, file);
      setProduct(updated);
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload variant image");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    product,
    loading,
    error,
    actions: {
      refreshProduct,
      addVariant,
      updateVariant,
      deleteVariant,
      uploadVariantImage,
    },
  };
};
