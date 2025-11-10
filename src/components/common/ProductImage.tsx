// src/components/common/ProductImage.tsx
import React from "react";
import { ERROR_AVATAR } from "../../constants/constants"; // you can create DEFAULT_PRODUCT_IMAGE too
import { getImageUrl } from "../../utils/getImageUrl";
interface ProductImageProps {
  imageUrl?: string | null;
  alt?: string;
  size?: number; // px
  rounded?: "full" | "lg" | "md" | "none";
  className?: string;
  border?: boolean; // optional border
}

const ProductImage: React.FC<ProductImageProps> = ({
  imageUrl,
  alt = "Product image",
  size = 80,
  rounded = "lg",
  className = "",
  border = true,
}) => {
  const url = getImageUrl(imageUrl);

  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
      ? "rounded-lg"
      : rounded === "md"
      ? "rounded-md"
      : "rounded-none";

  const borderClass = border ? "border border-gray-300 dark:border-gray-600" : "";

  return (
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      className={`object-cover ${roundedClass} ${borderClass} ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        if (img.src !== ERROR_AVATAR) {
          img.src = ERROR_AVATAR;
        }
      }}
    />
  );
};

export default ProductImage;
