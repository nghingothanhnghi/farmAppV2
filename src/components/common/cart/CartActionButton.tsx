import React, { useState } from "react";
import { useCart } from "../../../contexts/cartContext";
import { useCheckoutDialog } from "../../../contexts/checkoutDialogContext";
import { useAlert } from "../../../contexts/alertContext";
import Spinner from "../Spinner";
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

  const [loading, setLoading] = useState(false);

  const cartItem = items.find((i) => i.id === product.id);
  const quantityInCart = cartItem?.quantity ?? 0;

  const handleAdd = async () => {
    try {
      setLoading(true);
      // Ensure spinner shows at least 300ms
      await new Promise((resolve) => setTimeout(resolve, 300));
      await addToCart(product); // assuming it could be async
      setAlert({
        message: `${product.name} added to cart!`,
        type: "success",
      });
    } catch (err) {
      setAlert({ message: "Failed to add to cart.", type: "error" });
    } finally {
      setLoading(false);
    }
  };


  const handleCheckout = async () => {
    try {
      setLoading(true);
      // Ensure spinner shows at least 300ms
      await new Promise((resolve) => setTimeout(resolve, 300));
      await openCheckout(); // assuming openCheckout could be async
    } catch (err) {
      setAlert({ message: "Failed to open checkout.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return quantityInCart > 0 ? (
    // 👉 SHOW CHECKOUT BUTTON
    <Button
      label="Checkout"
      onClick={handleCheckout}
      variant="primary"
      size={size}
      rounded={rounded}
      className={className}
      icon={loading ? <Spinner size={16} colorClass="border-white" /> : undefined}
      iconPosition="left"
      disabled={loading}
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
