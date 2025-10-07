// src/components/payment/OrderForm.tsx
import React, { useState } from "react";
import WizardLayout from "../../common/WizardLayout";
import { useAuth } from "../../../contexts/authContext";
import { paymentService } from "../../../services/paymentService";
import type { PaymentCreate } from "../../../models/interfaces/Payment";

interface OrderFormProps {
  onCreated?: (payment: any) => void;
  mode?: "create" | "edit";
  initialData?: any;
  onUpdated?: (payment: any) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onCreated, mode = "create", initialData, onUpdated }) => {
  const { user, isAuthenticated, setShowLoginModal } = useAuth();
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Client ID</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={order.client_id}
              onChange={(e) => setOrder({ ...order, client_id: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Provider</label>
            <select
              className="w-full border p-2 rounded"
              value={order.provider}
              onChange={(e) => setOrder({ ...order, provider: e.target.value })}
            >
              <option value="manual">Manual</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Amount</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={order.amount}
              onChange={(e) => setOrder({ ...order, amount: parseFloat(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Currency</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={order.currency}
              onChange={(e) => setOrder({ ...order, currency: e.target.value })}
            />
          </div>

          {mode === "edit" && (
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                className="w-full border p-2 rounded"
                value={order.status}
                onChange={(e) => setOrder({ ...order, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Review",
      component: (
        <div className="space-y-3">
          <p><strong>Client:</strong> {order.client_id || "N/A"}</p>
          <p><strong>Provider:</strong> {order.provider}</p>
          <p><strong>Amount:</strong> {order.amount} {order.currency}</p>
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
    />
  );
}

export default OrderForm
