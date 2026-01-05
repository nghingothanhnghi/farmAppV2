import React from "react";
import { IconTrash, IconShoppingCart } from "@tabler/icons-react";
import { useWishlist } from "../../../contexts/wishlistContext";
import { useCart } from "../../../contexts/cartContext";
import { formatMoney } from "../../../utils/currency";
import ProductImage from "../ProductImage";
import Button from "../Button";

interface WishlistItemListProps {
  showControls?: boolean; // show remove & move-to-cart buttons
}

const WishlistItemList: React.FC<WishlistItemListProps> = ({
  showControls = true,
}) => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return <p className="text-gray-500 text-sm">Wishlist is empty</p>;
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="py-4 border-b border-gray-200 dark:border-gray-700 text-sm space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0"
        >
          {/* Product Image */}
          <div className="shrink-0 md:order-1">
            <ProductImage
              imageUrl={item.image_url}
              alt={item.name}
              size={40}
              rounded="md"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between md:order-3 md:justify-end gap-2">
            {showControls && (
              <>
                <Button
                  variant="secondary"
                  icon={<IconShoppingCart size={18} />}
                  iconOnly
                  label="Move to cart"
                  rounded="full"
                  onClick={() => {
                    addToCart({
                      id: item.id,
                      name: item.name,
                      base_price: item.price,
                      image_url: item.image_url,
                    } as any);
                    removeFromWishlist(item.id);
                  }}
                />

                <Button
                  variant="secondary"
                  icon={<IconTrash size={18} />}
                  iconOnly
                  label="Remove from wishlist"
                  rounded="full"
                  onClick={() => removeFromWishlist(item.id)}
                />
              </>
            )}

            {/* Price */}
            <div className="text-end md:order-4 md:w-32">
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatMoney(item.price)}
              </span>
            </div>
          </div>

          {/* Product name */}
          <div className="w-full min-w-0 flex-1 md:order-2 md:max-w-md">
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistItemList;
