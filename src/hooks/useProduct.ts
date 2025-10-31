// src/hooks/useProduct.ts
import { useState, useEffect, useCallback } from "react";
import { productService } from "../services/productService";
import type { Product, ProductCreate, ProductUpdate } from "../models/interfaces/Product";

export const useProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load products");
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch single product
  const fetchProduct = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = await productService.getById(id);
      setSelectedProduct(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Create product
  const createProduct = useCallback(async (data: ProductCreate) => {
    try {
      const newProduct = await productService.create(data);
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create product");
      throw err;
    }
  }, []);

  // ✅ Update product
  const updateProduct = useCallback(async (id: number, data: ProductUpdate) => {
    try {
      const updated = await productService.update(id, data);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      if (selectedProduct?.id === id) setSelectedProduct(updated);
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update product");
      throw err;
    }
  }, [selectedProduct]);

  // ✅ Delete product
  const deleteProduct = useCallback(async (id: number) => {
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete product");
      throw err;
    }
  }, []);

  // ✅ Upload product image
  const uploadProductImage = useCallback(async (productId: number, file: File) => {
    try {
      const updated = await productService.uploadProductImage(productId, file);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload product image");
      throw err;
    }
  }, []);

  // ✅ Upload variant image
  const uploadVariantImage = useCallback(async (variantId: number, file: File) => {
    try {
      await productService.uploadVariantImage(variantId, file);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload variant image");
      throw err;
    }
  }, []);

  // Auto load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    selectedProduct,
    loading,
    error,
    actions: {
      fetchProducts,
      fetchProduct,
      createProduct,
      updateProduct,
      deleteProduct,
      uploadProductImage,
      uploadVariantImage,
    },
  };
};
