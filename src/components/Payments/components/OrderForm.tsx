// src/components/payment/OrderForm.tsx
import React, { useState, useEffect } from "react";
import { formatCurrency, parseLocaleNumber } from "../../../utils/formatters";
import WizardLayout from "../../common/WizardLayout";
import { useAuth } from "../../../contexts/authContext";
import { paymentService } from "../../../services/paymentService";
import type { PaymentCreate } from "../../../models/interfaces/Payment";
import { FormGroup, FormLabel, FormInput, FormSelect } from "../../common/Form";
import { useCart } from "../../../contexts/cartContext";
import CartItemList from "../../common/cart/CartItemList";
import CartSummary from "../../common/cart/CartSummary";
interface OrderFormProps {
  onCreated?: (payment: any) => void;
  mode?: "create" | "edit";
  initialData?: any;
  onUpdated?: (payment: any) => void;
  onCartEmpty?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onCreated, mode = "create", initialData, onUpdated, onCartEmpty }) => {
  const { user, isAuthenticated, setShowLoginModal } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Partial<PaymentCreate & { status?: string; extra_metadata?: any }>>({
    client_id: initialData?.client_id || "",
    provider: initialData?.provider || "manual",
    amount: initialData?.amount || 0,
    currency: initialData?.currency || "VND",
    status: initialData?.status || "pending",
    extra_metadata: initialData?.extra_metadata || {},
  });

  // 🧠 Pre-fill order amount from cart when creating new payment
  useEffect(() => {
  if (mode !== "create") return;

  // 1️⃣ Cart becomes empty → clear amount + metadata
  if (items.length === 0) {
    setOrder(prev => ({
      ...prev,
      amount: 0,
      extra_metadata: {},
    }));
    onCartEmpty?.();   // 👈 CLOSE SIDE PANEL
    return;
  }

  // 2️⃣ Cart has items → sync amount + cart items
  setOrder(prev => ({
    ...prev,
    amount: totalAmount,
    extra_metadata: {
      ...prev.extra_metadata,
      cart_items: items.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        total: i.total,
      })),
    },
  }));
}, [items, totalAmount, mode]);


  const [confirmation, setConfirmation] = useState<any>(null);

  const goNext = async () => {
    if (currentStep === steps.length - 1) return;

    // ✅ On last step, submit
    if (currentStep === steps.length - 2) {
      if (!isAuthenticated || !user) {
        setShowLoginModal(true);
        return;
      }
      try {
        setLoading(true);
        if (mode === "edit" && initialData) {
          // For edit, only update status (based on PaymentUpdate interface)
          const updated = await paymentService.updatePayment(initialData.id, {
            status: order.status || initialData.status, // Assuming status is added to order state
            extra_metadata: order.extra_metadata || initialData.extra_metadata,
          });
          setConfirmation(updated);
          onUpdated?.(updated);
        } else {
          const created = await paymentService.createPayment({
            ...order,
            user_id: user.id,
            client_id: order.client_id ?? "default-client",
            provider: order.provider ?? "manual",
            amount: Number(order.amount),
          } as PaymentCreate);
          setConfirmation(created);
          // ✅ Notify parent so tab label updates
          onCreated?.(created);
          clearCart(); // 🧠 Clear cart after successful payment
        }
      } finally {
        setLoading(false);
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const steps = [
    {
      title: "Order Details",
      component: (
        <div className="space-y-4 p-4">
          {mode === "create" && (
            <>
              <CartItemList showControls={false} />
              <CartSummary />
            </>
          )}
          <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
            <div className='space-y-1'>
              <FormLabel htmlFor="client_id">Client ID</FormLabel>
            </div>
            <FormInput
              id="client_id"
              type="text"
              value={order.client_id ?? ""}
              onChange={(e) => setOrder({ ...order, client_id: e.target.value })}
            />
          </FormGroup>
          <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
            <div className='space-y-1'>
              <FormLabel htmlFor="provider">Provider</FormLabel>
            </div>
            <FormSelect
              id="provider"
              value={order.provider ?? "manual"}
              onChange={(e) => setOrder({ ...order, provider: e.target.value })}
            >
              <option value="manual">Manual</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
            </FormSelect>
          </FormGroup>
          <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
            <div className='space-y-1'>
              <FormLabel htmlFor="amount">Amount</FormLabel>
            </div>
            <div className="flex items-center gap-2">
              {/* Amount Input */}
              <FormInput
                id="amount"
                type="text"
                inputMode="decimal"
                value={order.amount ? formatCurrency(order.amount) : ""}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const parsedValue = parseLocaleNumber(inputValue);
                  setOrder({ ...order, amount: parsedValue });
                }}
                className="flex-1"
                placeholder="Enter amount"
              />

              {/* Currency Input (short width) */}
              <FormInput
                id="currency"
                type="text"
                value={order.currency ?? "VND"}
                onChange={(e) => setOrder({ ...order, currency: e.target.value })}
                className="w-24 text-center"
                placeholder="VND"
              />
            </div>
          </FormGroup>
          {mode === "edit" && (
            <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
              <div className='space-y-1'>
                <FormLabel htmlFor="status">Status</FormLabel>
              </div>
              <FormSelect
                id="status"
                value={order.status ?? "pending"}
                onChange={(e) => setOrder({ ...order, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </FormSelect>
            </FormGroup>
          )}
        </div>
      ),
    },
    {
      title: "Review",
      component: (
        <div className="space-y-4 p-4">
          <p><strong>Client:</strong> {order.client_id || "N/A"}</p>
          <p><strong>Provider:</strong> {order.provider}</p>
          <p><strong>Amount:</strong>   {order.amount
            ? `${formatCurrency(order.amount)} ${order.currency ?? ""}`
            : "N/A"} </p>
          {mode === "edit" && <p><strong>Status:</strong> {order.status}</p>}
          {!isAuthenticated && (
            <p className="text-red-500">⚠️ You must log in before confirming.</p>
          )}
        </div>
      ),
    },
    {
      title: "Confirmation",
      component: (
        <div className="space-y-4 text-center">
          {loading && <p>Creating order...</p>}
          {confirmation ? (
            <>
              <h2 className="text-xl font-semibold text-green-600">
                ✅ {mode === "edit" ? "Payment Updated!" : "Order Created!"}
              </h2>
              <p>{mode === "edit" ? "Payment" : "Order"} ID: {confirmation.id}</p>
              <p>Status: {confirmation.status}</p>
            </>
          ) : (
            <p>No order created yet.</p>
          )}
        </div>
      ),
      hideNav: true,
    },
  ];

  return (
    <WizardLayout
      steps={steps}
      currentStep={currentStep}
      goNext={goNext}
      goBack={goBack}
      navPosition="absolute"
    />
  );
}

export default OrderForm
