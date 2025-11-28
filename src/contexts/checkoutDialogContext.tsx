import React, { createContext, useContext, useState } from "react";
import CheckoutDialog from "../components/common/cart/CheckoutDialog";

interface CheckoutDialogContextType {
    openCheckout: () => void;
    closeCheckout: () => void;
}

const CheckoutDialogContext = createContext<CheckoutDialogContextType | null>(null);

export const CheckoutDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openCheckout = () => setIsOpen(true);
    const closeCheckout = () => setIsOpen(false);

    return (
        <CheckoutDialogContext.Provider value={{ openCheckout, closeCheckout }}>
            {children}

            {/* Render global dialog here */}
            <CheckoutDialog isOpen={isOpen} onClose={closeCheckout} />
        </CheckoutDialogContext.Provider>
    );
};

export const useCheckoutDialog = () => {
    const ctx = useContext(CheckoutDialogContext);
    if (!ctx) throw new Error("useCheckoutDialog must be used within CheckoutDialogProvider");
    return ctx;
};
