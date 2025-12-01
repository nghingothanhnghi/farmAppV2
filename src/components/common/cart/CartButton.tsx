// src/components/common/cart/CartButton.tsx
import React from "react";
import { IconShoppingBag } from "@tabler/icons-react";
import Button from "../Button";
import { useCart } from "../../../contexts/cartContext";
import { useCheckoutDialog } from "../../../contexts/checkoutDialogContext";

interface CartButtonProps {
    disabledIfEmpty?: boolean;  // default: true
    className?: string;
    rounded?: "sm" | "md" | "lg" | "full";
}

const CartButton: React.FC<CartButtonProps> = ({
    disabledIfEmpty = true,
    className,
    rounded = "full",
}) => {
    const { items } = useCart();

    const { openCheckout } = useCheckoutDialog(); // 👈 use global dialog

    const handleClick = () => {
        if (disabledIfEmpty && items.length === 0) return;
        openCheckout();
    };

    return (
        <>
            <Button
                variant="secondary"
                icon={
                    <div className="relative">
                        <IconShoppingBag size={18} />
                        {items.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {items.length}
                            </span>
                        )}
                    </div>
                }
                iconOnly
                label="Cart"
                className={className}
                rounded={rounded}
                onClick={handleClick}
            />
        </>
    );
};

export default CartButton;
