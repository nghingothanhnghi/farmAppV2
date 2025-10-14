// src/components/Payments/PaymentManagementPage.tsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAlert } from "../../contexts/alertContext";
import { paymentService } from "../../services/paymentService";
import type { PaymentOut, PaymentStatus } from "../../models/interfaces/Payment";
import PageTitle from "../common/PageTitle";
import DataGrid from "../common/dataGrid/dataGrid";
import Button from "../common/Button";
import Badge from "../common/Badge";
import DropdownButton from "../common/DropdownButton";
import Modal from "../common/Modal";
import LinearProgress from "../common/LinearProgress";
import { IconAlertCircle } from "@tabler/icons-react";
import { useAuth } from '../../contexts/authContext';
import PaymentTabs from "./components/PaymentTabs";
import useHasAnyRole from "../../hooks/useHasAnyRole";
import SideContentPanel from "../common/SideContentPanel";
import { useSideContent } from "../../hooks/useSideContent";

const PaymentManagementPage: React.FC = () => {
    const { user } = useAuth();
    const { setAlert } = useAlert();
    const isSuperAdmin = useHasAnyRole(["super_admin"]);
    const [payments, setPayments] = useState<PaymentOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentOut | null>(null);

    const sideContent = useSideContent();
    const [initialPayment, setInitialPayment] = useState<PaymentOut | undefined>(undefined);
   const fetchPayments = useCallback(async () => {
    if (!user) return; // 🟢 wait for user to be loaded

    try {
      let res: PaymentOut[] = [];

      if (isSuperAdmin) {
        // 🔄 Super admin: fetch all payments
        const allPayments = await paymentService.getAllPayments();
        res = allPayments.results;
      } else {
        // 🔄 Regular user: fetch only their payments
        const myUserId = user.id; // ✅ number
        res = await paymentService.getPaymentsByUser(myUserId);
      }

      setPayments(res);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setAlert({ message: "Failed to fetch payments", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin, setAlert]);


  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user, fetchPayments]);

    const handleStatusChange = async (paymentId: number, newStatus: PaymentStatus) => {
        try {
            const updated = await paymentService.updatePayment(paymentId, { status: newStatus });
            setPayments((prev) =>
                prev.map((p) => (p.id === paymentId ? { ...p, status: updated.status } : p))
            );
            setAlert({ message: `Payment status updated to ${updated.status}`, type: "success" });
        } catch (err) {
            console.error("Failed to update status:", err);
            setAlert({ message: "Failed to update payment status.", type: "error" });
        }
    };

    const handleRefund = async () => {
        if (!selectedPayment) return;
        try {
            await paymentService.refundStripePayment(selectedPayment.reference_id);
            setPayments((prev) =>
                prev.map((p) =>
                    p.id === selectedPayment.id ? { ...p, status: "refunded" } : p
                )
            );
            setAlert({
                message: `Payment ${selectedPayment.reference_id} refunded.`,
                type: "success",
            });
        } catch (err) {
            console.error("Refund failed:", err);
            setAlert({ message: "Failed to refund payment.", type: "error" });
        } finally {
            setConfirmModalOpen(false);
            setSelectedPayment(null);
        }
    };

    // 🔥 Refresh when payment created
    const handlePaymentCreated = (payment: PaymentOut) => {
        setPayments((prev) => [payment, ...prev]); // prepend newest
        setAlert({ message: `Payment #${payment.reference_id ?? payment.id} created!`, type: "success" });
    };

    // ✅ openPaymentTabs updated to set local state
    const openPaymentTabs = (payment?: PaymentOut) => {
        setInitialPayment(payment); // ✅ store selected payment in state
        sideContent.openSide(); // ✅ just open panel (PaymentTabs rendered below)
    };



    const columnDefs = useMemo(
        () => [
            { headerName: "ID", field: "id", width: 80 },
            { headerName: "Reference", field: "reference_id", flex: 1 },
            { headerName: "Provider", field: "provider", width: 120 },
            {
                headerName: "Amount",
                field: "amount",
                width: 120,
                valueFormatter: (params: any) =>
                    `${params.value} ${params.data.currency}`,
            },
            {
                headerName: "Status",
                field: "status",
                width: 140,
                cellRenderer: ({ value }: any) => {
                    const variant =
                        value === "paid"
                            ? "success"
                            : value === "pending"
                                ? "warning"
                                : value === "failed"
                                    ? "danger"
                                    : "secondary";
                    return <Badge label={value} variant={variant} />;
                },
            },
            { headerName: "Client", field: "client_id", width: 120 },
            { headerName: "User", field: "user_id", width: 120 },
            {
                headerName: "Actions",
                field: "actions",
                pinned: "right",
                width: 250,
                cellRenderer: ({ data }: any) => (
                    <div className="flex gap-2 justify-center">
                        <Button
                            label="View"
                            variant="primary"
                            size="xs"
                            onClick={() => openPaymentTabs(data)}
                        />
                        <DropdownButton
                            label="Set Status"
                            variant="secondary"
                            size="xs"
                            items={[
                                { label: "Pending", value: "pending" as PaymentStatus },
                                { label: "Completed", value: "completed" as PaymentStatus },
                                { label: "Failed", value: "failed" as PaymentStatus },
                                { label: "Refunded", value: "refunded" as PaymentStatus },
                            ]}
                            onSelect={(item) => handleStatusChange(data.id, item.value as PaymentStatus)}

                        />
                        <Button
                            label="Refund"
                            variant="danger"
                            size="xs"
                            disabled={data.status !== "paid"}
                            onClick={() => {
                                setSelectedPayment(data);
                                setConfirmModalOpen(true);
                            }}
                        />
                    </div>
                ),
            },
        ],
        []
    );

    if (loading) {
        return <LinearProgress position="absolute" thickness="h-1" duration={3000} />;
    }

    return (
        <div>
            <PageTitle
                title="Payment Management"
                actions={(
                    <Button
                        label="New Payment"
                        variant="primary"
                        size="sm"
                        onClick={() => openPaymentTabs()}
                    />
                )}
            />

            <SideContentPanel open={sideContent.sideOpen} onClose={sideContent.closeSide}>
                <PaymentTabs onPaymentCreated={handlePaymentCreated} initialPayment={initialPayment} onAllTabsClosed={() => sideContent.closeSide()} />
            </SideContentPanel>

            <DataGrid
                rowData={payments}
                columnDefs={columnDefs}
                pagination
                paginationPageSize={10}
                height="500px"
            />

            <Modal
                showCloseButton={false}
                size="xsmall"
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setSelectedPayment(null);
                }}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                        Are you sure you want to refund payment{" "}
                        <strong>{selectedPayment?.reference_id}</strong>?
                    </div>
                }
                actions={
                    <div className="flex gap-4">
                        <Button
                            label="Yes, Refund"
                            variant="danger"
                            onClick={handleRefund}
                            className="min-w-[150px]"
                            rounded="lg"
                        />
                        <Button
                            label="Cancel"
                            variant="secondary"
                            onClick={() => setConfirmModalOpen(false)}
                            className="min-w-[150px]"
                            rounded="lg"
                        />
                    </div>
                }
            />
        </div>
    );
};

export default PaymentManagementPage;
