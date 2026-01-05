import React, { useState } from "react";
import { useWishlist } from "../../../contexts/wishlistContext";
import { useAlert } from "../../../contexts/alertContext";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import Spinner from "../Spinner";
import Button from "../Button";
import type { Product } from "../../../models/interfaces/Product";

interface WishlistActionButtonProps {
  product: Product;
  size?: "xs" | "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const WishlistActionButton: React.FC<WishlistActionButtonProps> = ({
  product,
  size = "sm",
  rounded = "full",
  className,
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { setAlert } = useAlert();

  const [loading, setLoading] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleToggle = async () => {
    try {
      setLoading(true);
      // Ensure spinner shows at least 300ms
      await new Promise((resolve) => setTimeout(resolve, 300));

      toggleWishlist(product);

      setAlert({
        message: inWishlist
          ? `${product.name} removed from wishlist`
          : `${product.name} added to wishlist`,
        type: inWishlist ? "info" : "success",
      });
    } catch (err) {
      setAlert({
        message: "Failed to update wishlist.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      onClick={handleToggle}
      variant={inWishlist ? "secondary" : "primary"}
      size={size}
      rounded={rounded}
      className={className}
      iconOnly
      icon={
        loading ? (
          <Spinner size={14} />
        ) : inWishlist ? (
          <IconHeartFilled size={16} className="text-red-500" />
        ) : (
          <IconHeart size={16} />
        )
      }
      disabled={loading || inWishlist}
    />
  );
};

export default WishlistActionButton;
