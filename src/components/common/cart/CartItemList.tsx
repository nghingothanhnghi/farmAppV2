// src/components/common/cart/CartItemList.tsx
import React from "react";
import { useCart } from "../../../contexts/cartContext";
import { formatCurrency } from "../../../utils/formatters";
import ProductImage from "../ProductImage";
import NumberInput from "../../common/NumberInput";

interface CartItemListProps {
    showControls?: boolean; // Show + and – buttons
}

const CartItemList: React.FC<CartItemListProps> = ({ showControls = false }) => {
    const { items, increaseQuantity, decreaseQuantity } = useCart();

    if (items.length === 0) {
        return <p className="text-gray-500 text-sm">Cart is empty</p>;
    }

    return (
        <div className="space-y-1">
            {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1 border-b text-sm">
                    <ProductImage
                        imageUrl={item.image_url}
                        alt={item.name}
                        size={40}
                        rounded="md"
                    />
                    <div className="flex-1">
                        {item.name} x {item.quantity}
                    </div>

                    <div className="flex items-center gap-2">
                        {showControls && (
                            <NumberInput
                                id={`qty-${item.id}`}
                                value={item.quantity}
                                min={1}
                                onChange={(newQty) => {
                                    if (newQty > item.quantity) {
                                        increaseQuantity(item.id);
                                    } else if (newQty < item.quantity) {
                                        decreaseQuantity(item.id);
                                    }
                                }}
                                className="w-28"
                            />
                        )}

                        <span>{formatCurrency(item.total)} VND</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CartItemList;
