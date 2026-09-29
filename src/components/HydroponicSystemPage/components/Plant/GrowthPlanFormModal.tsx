// src/components/HydroponicSystemPage/components/GrowthPlanFormModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../../common/Modal";
import Button from "../../../common/Button";
import { FormGroup, FormLabel, FormInput, FormToggle } from "../../../common/Form";
import type { GrowthPlan } from "../../../../models/interfaces/GrowthPlan";

export interface GrowthPlanFormValues {
  name: string;
  description: string;
  is_default: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: GrowthPlan | null;
  onSubmit: (values: GrowthPlanFormValues) => Promise<void>;
}

const GrowthPlanFormModal: React.FC<Props> = ({ isOpen, onClose, mode, initialData, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? "");
      setIsDefault(initialData.is_default);
    } else {
      setName("");
      setDescription("");
      setIsDefault(false);
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      setLoading(true);
      await onSubmit({ name: name.trim(), description: description.trim(), is_default: isDefault });
      onClose();
    } catch {
      // parent already surfaced the error; keep modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Growth Plan" : "New Growth Plan"}
      size="small"
      content={
        <div className="px-10 pb-4 space-y-4">
          <FormGroup className="space-y-1">
            <FormLabel htmlFor="plan_name">Name</FormLabel>
            <FormInput
              id="plan_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Plan"
              required
            />
          </FormGroup>

          <FormGroup className="space-y-1">
            <FormLabel htmlFor="plan_description">Description</FormLabel>
            <FormInput
              id="plan_description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </FormGroup>

          <FormGroup className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Default plan</p>
              <p className="text-[11px] text-gray-400">
                Used automatically when a batch is created without choosing a plan.
              </p>
            </div>
            <FormToggle
              id="plan_is_default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="shrink-0"
            />
          </FormGroup>
        </div>
      }
      actions={
        <div className="flex gap-4">
          <Button
            label={loading ? "Saving..." : mode === "edit" ? "Update" : "Create"}
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="min-w-[150px]"
            rounded="lg"
          />
          <Button
            label="Cancel"
            variant="secondary"
            onClick={onClose}
            className="min-w-[150px]"
            rounded="lg"
          />
        </div>
      }
    />
  );
};

export default GrowthPlanFormModal;