import React from "react";
import { useCart } from "../../../contexts/cartContext";
import { formatCurrency } from "../../../utils/formatters";

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
          <div className="flex-1">
            {item.name} x {item.quantity}
          </div>

          <div className="flex items-center gap-2">
            {showControls && (
              <>
                <button
                  onClick={() => decreaseQuantity(item.id)}
                  className="w-6 h-6 flex items-center justify-center border rounded"
                >
                  -
                </button>

                <span className="w-6 text-center">{item.quantity}</span>

                <button
                  onClick={() => increaseQuantity(item.id)}
                  className="w-6 h-6 flex items-center justify-center border rounded"
                >
                  +
                </button>
              </>
            )}

            <span>{formatCurrency(item.total)} VND</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartItemList;
