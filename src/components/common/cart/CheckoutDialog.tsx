import React from "react";
import { useNavigate } from "react-router";
import Modal from "../../common/Modal";
import CartItemList from "./CartItemList";
import CartSummary from "./CartSummary";
import Button from "../../common/Button";

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  isOpen,
  onClose
}) => {
    const navigate = useNavigate();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Summary"
      size="small"
      content={
        <div className="px-4 pb-4">
          <CartItemList showControls={true} />
          <CartSummary />
        </div>
      }
      actions={
        <div className="flex flex-col gap-3 w-full">
          <Button
            label="Continue to Payment"
            variant="primary"
            className="w-full"
          onClick={() => {
            onClose();
            navigate("/payments", {
              state: { fromCart: true }, // 🔥 triggers sidepanel
            });
          }}
          />
        </div>
      }
    />
  );
};

export default CheckoutDialog;
