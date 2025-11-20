// src/components/common/cart/CartSummary.tsx
import { useCart } from "../../../contexts/cartContext";
import { formatCurrency } from "../../../utils/formatters";

const CartSummary = () => {
  const { totalAmount } = useCart();

  return (
    <div className="border-t pt-2 text-right font-semibold">
      Total: {formatCurrency(totalAmount)} VND
    </div>
  );
};

export default CartSummary;
