import Modal from "./Modal";
import QRCodeImage from "./QRCodeImage";
import Button from "./Button";

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl?: string | null;
  productName: string;
}

const QRCodeDialog = ({
  isOpen,
  onClose,
  qrCodeUrl,
  productName,
}: QRCodeDialogProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Scan ${productName}`}
      size="small"
      content={
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <QRCodeImage
            imageUrl={qrCodeUrl}
            size={240}
            rounded="md"
            border
          />

          <p className="text-sm text-gray-500 text-center">
            Scan this QR code to view the product
          </p>
        </div>
      }
      actions={
        <Button
          label="Close"
          variant="secondary"
          onClick={onClose}
          rounded="lg"
        />
      }
    />
  );
};

export default QRCodeDialog;
