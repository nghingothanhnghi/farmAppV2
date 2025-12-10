import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Modal from "../../common/Modal";
import CartItemList from "./CartItemList";
import CartSummary from "./CartSummary";
import Button from "../../common/Button";
import Spinner from "../Spinner";
import { useCart } from "../../../contexts/cartContext";

interface CheckoutDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
    isOpen,
    onClose
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const { items } = useCart();
    const navigate = useNavigate();

    const isCartEmpty = items.length === 0; // <-- check if empty

        // ✅ Reset loading state whenever modal is opened
    useEffect(() => {
        if (isOpen) {
            setIsLoading(false);
        }
    }, [isOpen]);
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Order Summary"
            size="small"
            content={
                <div className="px-10 pb-4">
                    <CartItemList showControls={true} />
                    <CartSummary />
                </div>
            }
            actions={
                <div className="flex flex-col gap-4 w-full">
                    <Button
                        label={isLoading ? "Processing..." : "Continue to Payment"}
                        icon={isLoading ? <Spinner size={18} colorClass="border-white" /> : null}
                        iconPosition="left"
                        variant="primary"
                        className="w-full"
                        rounded="lg"
                        disabled={isLoading || isCartEmpty}
                        onClick={async () => {
                            setIsLoading(true);
                            await new Promise(res => setTimeout(res, 600)); // smooth transition
                            onClose();
                            navigate("/payments", { state: { fromCart: true } });
                        }}
                    />
                    <Button
                        label="Cancel"
                        variant="secondary"
                        onClick={onClose}
                        className='min-w-[150px]'
                        rounded='lg'
                    />
                </div>
            }
        />
    );
};

export default CheckoutDialog;
