// src/components/billiard/components/ControllerApiKeyModal.tsx
// Step 3 of the controller flow: show the api_key exactly once.
import React, { useEffect, useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import type { ControllerRegisterResponse } from '../../../models/interfaces/Billiard';

interface Props {
  /** The register response. The parent drops it on Done, so the key is never shown again. */
  result: ControllerRegisterResponse | null;
  onDone: () => void;
}

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const ControllerApiKeyModal: React.FC<Props> = ({ result, onDone }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setCopied(null);
    setConfirmed(false);
  }, [result?.api_key]);

  if (!result) return null;

  const headers = `X-Device-Id: ${result.device_id}\nX-Device-Key: ${result.api_key}`;

  const copy = async (id: string, text: string) => {
    if (await copyText(text)) {
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    }
  };

  const Row: React.FC<{ id: string; label: string; value: string }> = ({ id, label, value }) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 break-all rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">{value}</code>
        <Button
          label={copied === id ? 'Copied' : 'Copy'}
          variant="secondary"
          size="sm"
          rounded="lg"
          icon={copied === id ? <IconCheck size={14} /> : <IconCopy size={14} />}
          iconPosition="left"
          onClick={() => copy(id, value)}
        />
      </div>
    </div>
  );

  return (
    <Modal
      isOpen
      // Closing is deliberate: only the Done button (after confirming) dismisses this dialog.
      onClose={() => {}}
      showCloseButton={false}
      title="Controller registered"
      size="small"
      content={
        <div className="space-y-4 px-7 pb-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            This API key is shown <strong>only once</strong>. Copy it into the firmware now. It cannot be retrieved later.
          </div>
          <Row id="id" label="Device ID → X-Device-Id header" value={result.device_id} />
          <Row id="key" label="API key → X-Device-Key header" value={result.api_key} />
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Firmware request headers</p>
            <pre className="whitespace-pre-wrap break-all rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">{headers}</pre>
            <Button label={copied === 'both' ? 'Copied' : 'Copy both headers'} variant="secondary" size="sm" rounded="lg" onClick={() => copy('both', headers)} />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            I have copied the API key into the firmware.
          </label>
        </div>
      }
      actions={<Button label="Done" onClick={onDone} disabled={!confirmed} className="min-w-[150px]" rounded="lg" />}
    />
  );
};

export default ControllerApiKeyModal;
