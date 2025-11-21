// src/components/common/cart/CartSummary.tsx
import { useCart } from "../../../contexts/cartContext";
import { formatMoney } from "../../../utils/currency";

const CartSummary = () => {
  const { totalAmount } = useCart();

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 text-right font-semibold">
      Total: {formatMoney(totalAmount)}
    </div>
  );
};

export default CartSummary;
