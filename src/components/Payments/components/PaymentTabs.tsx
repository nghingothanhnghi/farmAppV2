// src/components/payment/PaymentTabs.tsx
import React, { useState, useEffect } from "react";
import Tabs from "../../common/Tabs";
import Button from "../../common/Button";
import OrderForm from "./OrderForm";
import { IconPencil, IconPlus, IconX } from "@tabler/icons-react";

interface PaymentTab {
  id: string;
  label: string;
  type: "create" | "view" | "edit";
  data?: any; // Payment data if viewing/editing
}

interface PaymentTabsProps {
  onPaymentCreated?: (payment: any) => void; // <-- add this
  initialPayment?: any; // 👈 payment to open initially
  onAllTabsClosed?: () => void;
}

const PaymentTabs: React.FC<PaymentTabsProps> = ({ onPaymentCreated, initialPayment, onAllTabsClosed }) => {
  // ✅ Initialize based on initialPayment
  const [tabs, setTabs] = useState<PaymentTab[]>(() =>
    initialPayment
      ? [
        {
          id: `view-${initialPayment.id}`,
          label: `#${initialPayment.reference_id ?? initialPayment.id}`,
          type: "view",
          data: initialPayment,
        },
      ]
      : [{ id: "new", label: "#Draft", type: "create" }]
  );
  const [activeTab, setActiveTab] = useState<string>(() =>
    initialPayment ? `view-${initialPayment.id}` : "new"
  );


  useEffect(() => {
    if (initialPayment) {
      openViewTab(initialPayment);
    }
  }, [initialPayment]);

  /** ✅ Update tab label after OrderForm creates a payment */
  const updateTabLabel = (id: string, newLabel: string, data?: any) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, label: newLabel, data, type: "view" } : t
      )
    );
  };

  const openViewTab = (payment: any) => {
    const viewId = `view-${payment.id}`;
    const editId = `edit-${payment.id}`;

    setTabs((prev) => {
      // If already have a view tab, just activate
      if (prev.some((t) => t.id === viewId)) {
        setActiveTab(viewId);
        return prev;
      }

      // If currently an edit tab, convert it back to view
      if (prev.some((t) => t.id === editId)) {
        return prev.map((t) =>
          t.id === editId
            ? {
              ...t,
              id: viewId,
              label: `#${payment.reference_id ?? payment.id}`,
              type: "view",
              data: payment,
            }
            : t
        );
      }

      // Otherwise create a fresh view tab
      return [
        ...prev,
        {
          id: viewId,
          label: `#${payment.reference_id ?? payment.id}`,
          type: "view",
          data: payment,
        },
      ];
    });

    setActiveTab(viewId);
  };

  const openEditTab = (payment: any) => {
    const viewId = `view-${payment.id}`;
    const editId = `edit-${payment.id}`;

    setTabs((prev) => {
      let updatedTabs = [...prev];

      // 🔹 Remove current view tab if open
      updatedTabs = updatedTabs.filter((t) => t.id !== viewId);

      // 🔹 If we already have an edit tab, just activate it
      if (updatedTabs.some((t) => t.id === editId)) {
        setActiveTab(editId);
        return updatedTabs;
      }

      // 🔹 Add a new edit tab
      updatedTabs.push({
        id: editId,
        label: `#${payment.reference_id ?? payment.id} (edit)`,
        type: "edit",
        data: payment,
      });

      setActiveTab(editId);
      return updatedTabs;
    });
  };

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const updated = prev.filter((t) => t.id !== id);

      // ✅ If no tabs left, trigger parent close
      if (updated.length === 0) {
        onAllTabsClosed?.();
      }

      return updated;
    });

    if (activeTab === id) {
      setActiveTab((prev) =>
        prev === id ? (tabs[0]?.id ?? "") : prev
      );
    }
  };

  const openNewTab = () => {
    const id = `new-${Date.now()}`;
    setTabs((prev) => [...prev, { id, label: "#Draft", type: "create" }]);
    setActiveTab(id);
  };

  const tabItems = tabs.map((tab) => ({
    id: tab.id,
    label: (
      <div className="flex items-center">
        {tab.label}
        <span
          onClick={(e) => {
            e.stopPropagation();
            closeTab(tab.id);
          }}
          className="ml-2 text-gray-400 hover:text-red-500"
        >
          <IconX size={14} />
        </span>
      </div>
    ),
    content:
      tab.type === "create" ? (
        <OrderForm
          onCreated={(payment) => {
            // ✅ Update tab label to reference ID when order is created
            updateTabLabel(
              tab.id,
              `#${payment.reference_id ?? payment.id}`,
              payment
            );
            // 🔥 Notify parent (PaymentManagementPage)
            onPaymentCreated?.(payment);
          }}
        />
      ) : tab.type === "view" ? (
        <div>
          <h2 className="text-xl font-bold">
            Payment #{tab.data.reference_id ?? tab.data.id}
          </h2>
          <p>Amount: {tab.data.amount}</p>
          <p>Status: {tab.data.status}</p>
          <button
            className="mt-2 text-blue-500 underline"
            onClick={() => openEditTab(tab.data)}
          >
            <IconPencil size={14} className="inline mr-1" /> Edit
          </button>
        </div>
      ) : (
        <OrderForm mode="edit" initialData={tab.data} onUpdated={(updated) => {
          // Update the tab data and convert back to view
          setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, type: "view", data: updated, label: `#${updated.reference_id ?? updated.id}` } : t));
          setActiveTab(tab.id); // Keep same tab active
        }} />
      ),
  }));

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 line-clamp-1">Payments</h3>
        <Button
          label="New"
          icon={<IconPlus size={16} />}
          variant="primary"
          size="sm"
          rounded="md"
          onClick={openNewTab}
        />
      </div>
      <Tabs tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default PaymentTabs;
