// src/components/Product/components/ProductCard.tsx
import React, { useState, useEffect } from "react";
import { IconTrash } from '@tabler/icons-react';
import type { Product } from "../../../models/interfaces/Product";
import Button from "../../common/Button";
import { HoverSlideIn } from "../../common/HoverSlideIn";
import { useCart } from "../../../contexts/cartContext";
import ProductImage from "../../common/ProductImage";

interface ProductCardProps {
    product: Product;
    onDelete?: (id: number) => void;
    onSelect?: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onDelete,
    onSelect,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart } = useCart();

  // ✅ Log product image URL when component renders
  useEffect(() => {
    console.log("🖼️ Product:", product.name);
    console.log("→ image_url from API:", product.image_url);
  }, [product]);

    return (
        <div
            className="
        relative
        flex flex-col
        overflow-hidden 
        transition-all 
        duration-300 
        hover:shadow-lg 
        hover:-translate-y-1
        "
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="cursor-pointer flex flex-col items-center"
                onClick={() => onSelect?.(product.id)}
            >
                <div className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg">
                    {product.image_url ? (
                        <ProductImage
                            imageUrl={product.image_url}
                            alt={product.name}
                            size={200} // width/height of the card image
                            rounded="lg"
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                    ) : (
                        <span className="text-gray-400 text-sm">No Image</span>
                    )}
                </div>
                <div className="w-full p-4">
                    <p className="text-gray-800 dark:text-gray-400 text-xs">{product.base_price} USD</p>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{product.name}</h3>
                    <p className="text-gray-600 text-sm">
                        {product.description || "No description"}
                    </p>

                </div>
            </div>
            <HoverSlideIn
                isHovered={isHovered}
                from="top"
                className="absolute top-4 right-4"
            >
                <div className="bg-white p-0.5 rounded-full shadow-md">
                    <Button
                        label="Add to Cart"
                        onClick={() => addToCart(product)}
                        variant="primary"
                        rounded="full"
                    />
                    <Button
                        variant="secondary"
                        icon={<IconTrash size={18} />}
                        iconOnly
                        label="Delete"
                        className='bg-transparent'
                        onClick={() => onDelete?.(product.id)}
                        rounded='full'
                    />
                </div>

            </HoverSlideIn>
        </div>
    );
};
