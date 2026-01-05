import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "../models/interfaces/Product";
import { useAuth } from "./authContext";

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image_url?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";

  const [items, setItems] = useState<WishlistItem[]>([]);

  // ⭐ Load wishlist when user changes
  useEffect(() => {
    const saved = localStorage.getItem(`wishlist_${userId}`);
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems([]);
    }
  }, [userId]);

  // ⭐ Persist wishlist
  useEffect(() => {
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(items));
  }, [items, userId]);

  const addToWishlist = (product: Product) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === product.id)) return prev;

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.base_price,
          image_url: product.image_url,
        },
      ];
    });
  };

  const removeFromWishlist = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    setItems((prev) =>
      prev.some((i) => i.id === product.id)
        ? prev.filter((i) => i.id !== product.id)
        : [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: product.base_price,
              image_url: product.image_url,
            },
          ]
    );
  };

  const isInWishlist = (productId: number) =>
    items.some((i) => i.id === productId);

  const clearWishlist = () => setItems([]);

  const count = useMemo(() => items.length, [items]);

  const value = {
    items,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    count,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
