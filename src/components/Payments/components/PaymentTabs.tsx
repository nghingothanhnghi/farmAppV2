// src/components/payment/PaymentTabs.tsx
import React, { useState } from "react";
import Tabs from "../../common/Tabs";
import OrderForm from "./OrderForm";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";

interface PaymentTab {
  id: string;
  label: string;
  type: "create" | "view" | "edit";
  data?: any; // Payment data if viewing/editing
}

const PaymentTabs: React.FC = () => {
  const [tabs, setTabs] = useState<PaymentTab[]>([
    { id: "new", label: "#Draft", type: "create" },
  ]);
  const [activeTab, setActiveTab] = useState<string>("new");

  /** ✅ Update tab label after OrderForm creates a payment */
  const updateTabLabel = (id: string, newLabel: string, data?: any) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, label: newLabel, data, type: "view" } : t
      )
    );
  };

  const openViewTab = (payment: any) => {
    const id = `view-${payment.id}`;
    if (!tabs.find((t) => t.id === id)) {
      setTabs((prev) => [
        ...prev,
        {
          id,
          label: `#${payment.reference_id ?? payment.id}`,
          type: "view",
          data: payment,
        },
      ]);
    }
    setActiveTab(id);
  };

  const openEditTab = (payment: any) => {
    const id = `edit-${payment.id}`;
    if (!tabs.find((t) => t.id === id)) {
      setTabs((prev) => [
        ...prev,
        {
          id,
          label: `#${payment.reference_id ?? payment.id} (edit)`,
          type: "edit",
          data: payment,
        },
      ]);
    }
    setActiveTab(id);
  };

  const closeTab = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== id));
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
          <IconTrash size={14} />
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
        <OrderForm /> // Future: Pass tab.data to prefill edit form
      ),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-bold">Payments</h1>
        <button
          onClick={openNewTab}
          className="flex items-center px-3 py-1 bg-orange-600 text-white rounded-lg"
        >
          <IconPlus size={16} className="mr-1" /> New
        </button>
      </div>

      <Tabs tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default PaymentTabs;
