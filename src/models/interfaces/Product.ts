// src/models/interfaces/Product.ts
export interface ProductVariant {
  id?: number;
  name: string;
  sku?: string;
  price: number;
  stock?: number;
  attributes?: Record<string, any>;
  image_url?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  sku?: string;
  is_active?: boolean;
  image_url?: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
  variants: ProductVariant[];
}

export interface ProductCreate {
  name: string;
  description?: string;
  base_price: number;
  sku?: string;
  is_active?: boolean;
  image_url?: string;
  variants?: ProductVariant[];
}

export interface ProductUpdate extends Partial<ProductCreate> {}
