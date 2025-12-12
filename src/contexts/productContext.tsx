import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useProduct } from "../hooks/useProduct";

interface ProductProviderProps {
  children: ReactNode;
}

const ProductContext = createContext<ReturnType<typeof useProduct> | null>(null);

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const product = useProduct();

  return (
    <ProductContext.Provider value={product}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProductContext must be used inside ProductProvider");
  return ctx;
};
