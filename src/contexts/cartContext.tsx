// src/contexts/cartContext.tsx
import React, { createContext, useContext, useState, useMemo } from "react";
import type { Product } from "../models/interfaces/Product";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  totalAmount: number;
  clientId?: string;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  setClientId: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [clientId, setClientId] = useState<string>();

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
            : i
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.base_price, quantity: 1, total: product.base_price },
      ];
    });
  };

  const removeFromCart = (productId: number) =>
    setItems((prev) => prev.filter((i) => i.id !== productId));

  const clearCart = () => setItems([]);

  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + i.total, 0), [items]);

  const value = { items, totalAmount, clientId, addToCart, removeFromCart, clearCart, setClientId };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
