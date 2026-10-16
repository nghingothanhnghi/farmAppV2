// src/components/billiard/components/ReceiptPreviewModal.tsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconPrinter } from '@tabler/icons-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { buildReceiptHtml, printHtml } from '../../../utils/receipt';
import type { BillResponse } from '../../../models/interfaces/Billiard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bill: BillResponse;
}

const ReceiptPreviewModal: React.FC<Props> = ({ isOpen, onClose, bill }) => {
  const {t} = useTranslation();
  const html = useMemo(() => buildReceiptHtml(bill), [bill]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("billiard_tables.modals.print.preview")}
      size="small"
      content={
        <div className="px-10 pb-4">
          <iframe
            title="Receipt preview"
            srcDoc={html}
            className="w-full h-[55vh] rounded-lg border border-gray-200 bg-white"
          />
        </div>
      }
      actions={
        <div className="flex gap-4">
          <Button
            label={t("btn.print")}
            icon={<IconPrinter size={16} />}
            iconPosition="left"
            onClick={() => printHtml(html)}
            className="min-w-[150px]"
            rounded="lg"
          />
          <Button label={t("btn.cancel")} variant="secondary" onClick={onClose} className="min-w-[150px]" rounded="lg" />
        </div>
      }
    />
  );
};

export default ReceiptPreviewModal;