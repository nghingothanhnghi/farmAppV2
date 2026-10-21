// src/components/common/cart/CartItemList.tsx
import React from "react";
import { IconTrash } from "@tabler/icons-react";
import CartEmptyImg from '../../../assets/icons/cart_empty.png'
import { useCart } from "../../../contexts/cartContext";
import { formatMoney } from "../../../utils/currency";
import ProductImage from "../ProductImage";
import NumberInput from "../../common/NumberInput";
import Button from "../Button";
import EmptyState from "../EmptyState";

interface CartItemListProps {
    showControls?: boolean; // Show + and – buttons, and Remove button
}

const CartItemList: React.FC<CartItemListProps> = ({ showControls = false }) => {
    const { items, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

    if (items.length === 0) {
        return <EmptyState
            imageSrc={CartEmptyImg}
            width={150}
            height={150} message="Nothing in your cart yet. Browse our products and add your favorites!" />
    }

    return (
        <div className="space-y-1">
            {items.map((item) => (
                <div key={item.id} className="py-4 border-b border-gray-200 dark:border-gray-700 text-sm space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                    <div className="shrink-0 md:order-1">
                        <ProductImage
                            imageUrl={item.image_url}
                            alt={item.name}
                            size={40}
                            rounded="md"
                        />
                    </div>
                    <div className="flex items-center justify-between md:order-3 md:justify-end">
                        {showControls && (
                            <>
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
                                <Button
                                    variant="secondary"
                                    icon={<IconTrash size={18} />
                                    }
                                    iconOnly
                                    label="Cart"
                                    rounded="full"
                                    onClick={() => removeFromCart(item.id)}
                                />
                            </>
                        )}


                        <div className="text-end md:order-4 md:w-32">
                            <span className="font-semibold text-gray-900 dark:text-white">{formatMoney(item.total)}</span>
                        </div>
                    </div>
                    <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                        {item.name} x {item.quantity}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CartItemList;
