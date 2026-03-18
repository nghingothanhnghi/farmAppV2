// src/services/productService.ts
import apiClient from "../api/client";
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductVariant,
} from "../models/interfaces/Product";

export const productService = {
  // --- Products ---
  async getAll(): Promise<Product[]> {
    const res = await apiClient.get("/products");
    return res.data;
  },

  async getById(id: number): Promise<Product> {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  async create(data: ProductCreate): Promise<Product> {
    const res = await apiClient.post("/products", data);
    return res.data;
  },

  async update(id: number, data: ProductUpdate): Promise<Product> {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async regenerateQrCode(productId: number): Promise<Product> {
    const res = await apiClient.post(`/products/${productId}/qr-code`);
    return res.data;
  },

  async uploadProductImage(productId: number, file: File): Promise<Product> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`/products/${productId}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // --- Variants ---
  async getAllVariantSKUs(): Promise<string[]> {
    const res = await apiClient.get("/products/variants/skus");
    return res.data;
  },

  async createVariant(productId: number, variant: ProductVariant): Promise<Product> {
    const res = await apiClient.post(`/products/${productId}/variants`, variant);
    return res.data;
  },

  async updateVariant(variantId: number, data: Partial<ProductVariant>): Promise<Product> {
    const res = await apiClient.put(`/products/variants/${variantId}`, data);
    return res.data;
  },

  async deleteVariant(variantId: number): Promise<void> {
    await apiClient.delete(`/products/variants/${variantId}`);
  },

  async uploadVariantImage(variantId: number, file: File): Promise<Product> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`/products/variants/${variantId}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },



};
