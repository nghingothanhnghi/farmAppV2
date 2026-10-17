// src/components/billiard/components/RegisterControllerModal.tsx
// Step 2 of the controller flow: pick a hydro device (or type a device_id) and register it.
import React, { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { FormGroup, FormInput, FormLabel, FormSelect } from '../../common/Form';
import { billiardService } from '../../../services/billiard_service';
import { billiardErrorMessage } from '../../../utils/billiard';
import type { ControllerRegisterResponse, HydroCandidate } from '../../../models/interfaces/Billiard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the register response (contains the one-time api_key). */
  onRegistered: (res: ControllerRegisterResponse) => void;
}

const RegisterControllerModal: React.FC<Props> = ({ isOpen, onClose, onRegistered }) => {
  const [candidates, setCandidates] = useState<HydroCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [selected, setSelected] = useState('');
  const [manual, setManual] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setSelected('');
    setManual('');
    setName('');
    setError(null);
    setCandidatesError(null);
    setLoadingCandidates(true);
    billiardService
      .getControllerCandidates()
      .then((list) => !cancelled && setCandidates(list))
      .catch((err) => {
        if (cancelled) return;
        setCandidates([]);
        // Non-fatal: the manual device_id field still works.
        setCandidatesError(billiardErrorMessage(err, 'Failed to load device candidates'));
      })
      .finally(() => !cancelled && setLoadingCandidates(false));
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // A typed device_id wins over the dropdown.
  const deviceId = manual.trim() || selected;

  const handleSubmit = async () => {
    if (!deviceId) {
      setError('Choose a device or enter a device ID.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await billiardService.registerController({
        device_id: deviceId,
        ...(name.trim() ? { name: name.trim() } : {}),
      });
      onRegistered(res);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to register controller'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => {} : onClose}
      title="Register controller"
      size="small"
      content={
        <div className="space-y-4 px-7 pb-4">
          <FormGroup className="space-y-1">
            <FormLabel htmlFor="controller_candidate">Device</FormLabel>
            <FormSelect
              id="controller_candidate"
              className="w-full"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              disabled={submitting || loadingCandidates}
            >
              <option value="">{loadingCandidates ? 'Loading devices…' : 'Select a device'}</option>
              {candidates.map((c) => (
                <option key={c.device_id} value={c.device_id}>
                  {c.name ? `${c.name} (${c.device_id})` : c.device_id}
                </option>
              ))}
            </FormSelect>
            {candidatesError && <p className="text-xs text-amber-600">{candidatesError} You can still enter the device ID below.</p>}
            {!loadingCandidates && !candidatesError && candidates.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">No candidates found. Enter the device ID below.</p>
            )}
          </FormGroup>

          <FormGroup className="space-y-1">
            <FormLabel htmlFor="controller_device_id">Or enter device ID manually (optional)</FormLabel>
            <FormInput
              id="controller_device_id"
              type="text"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              disabled={submitting}
              placeholder="e.g. esp32-billiard-01"
            />
          </FormGroup>

          <FormGroup className="space-y-1">
            <FormLabel htmlFor="controller_name">Name (optional)</FormLabel>
            <FormInput id="controller_name" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
          </FormGroup>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      }
      actions={
        <div className="flex gap-4">
          <Button label={submitting ? 'Registering…' : 'Register'} onClick={handleSubmit} disabled={submitting || !deviceId} className="min-w-[150px]" rounded="lg" />
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={submitting} className="min-w-[150px]" rounded="lg" />
        </div>
      }
    />
  );
};

export default RegisterControllerModal;
