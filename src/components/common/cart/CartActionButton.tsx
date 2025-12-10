import React from "react";
import { useCart } from "../../../contexts/cartContext";
import { useCheckoutDialog } from "../../../contexts/checkoutDialogContext";
import { useAlert } from "../../../contexts/alertContext";
import Button from "../Button";
import type { Product } from "../../../models/interfaces/Product";

interface CartActionButtonProps {
  product: Product;
  size?: "xs" | "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const CartActionButton: React.FC<CartActionButtonProps> = ({
  product,
  size = "sm",
  rounded = "full",
  className,
}) => {
  const { items, addToCart } = useCart();
  const { openCheckout } = useCheckoutDialog();
  const { setAlert } = useAlert();

  const cartItem = items.find((i) => i.id === product.id);
  const quantityInCart = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addToCart(product);
    setAlert({
      message: `${product.name} added to cart!`,
      type: "success",
    });
  };

  return quantityInCart > 0 ? (
    // 👉 SHOW CHECKOUT BUTTON
    <Button
      label="Checkout"
      onClick={openCheckout}
      variant="primary"
      size={size}
      rounded={rounded}
      className={className}
    />
  ) : (
    // 👉 SHOW ADD TO CART BUTTON
    <Button
      label="Add to Cart"
      onClick={handleAdd}
      variant="primary"
      size={size}
      rounded={rounded}
      className={className}
    />
  );
};

export default CartActionButton;
