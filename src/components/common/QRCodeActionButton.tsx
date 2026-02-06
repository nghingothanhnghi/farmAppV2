import React, { useState } from "react";
import { IconQrcode } from "@tabler/icons-react";
import Button from "./Button";
import type { Product } from "../../models/interfaces/Product";
import QRCodeDialog from "./QRCodeDialog";

interface QRCodeActionButtonProps {
    product: Product;
    size?: "xs" | "sm" | "md" | "lg";
    rounded?: "sm" | "md" | "lg" | "full";
    className?: string;
}

const QRCodeActionButton: React.FC<QRCodeActionButtonProps> = ({
    product,
    size = "sm",
    rounded = "full",
    className,
}) => {

    const [showQR, setShowQR] = useState(false);

    // No QR? No button.
    if (!product.qr_code_url) return null;

    return (
        <>
            <Button
                label="View QR Code"
                onClick={() => setShowQR(true)}
                variant="secondary"
                size={size}
                rounded={rounded}
                className={className}
                iconOnly
                icon={<IconQrcode size={16} />}
            />

            <QRCodeDialog
                isOpen={showQR}
                onClose={() => setShowQR(false)}
                qrCodeUrl={product.qr_code_url}
                productName={product.name}
            />
        </>
    );
};

export default QRCodeActionButton;
