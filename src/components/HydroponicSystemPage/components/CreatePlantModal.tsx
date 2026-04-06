// src/components/Plant/CreatePlantModal.tsx

import React, { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import {
  FormGroup,
  FormLabel,
  FormInput,
} from "../../common/Form";
import type { Plant } from "../../../models/interfaces/Plant";
import { usePlants } from "../../../hooks/usePlants";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (plant: Plant) => void;
};

const CreatePlantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { createPlant } = usePlants();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);

      const plant = await createPlant({ name });

      onCreated?.(plant); // 👈 notify parent

      setName("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🌱 Tạo cây trồng mới"
      size="small"
      content={
        <div className="px-10 pb-4 space-y-5">
          <FormGroup className="space-y-1">
            <FormLabel htmlFor="plant_name">Tên cây</FormLabel>
            <FormInput
              id="plant_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormGroup>
        </div>
      }
      actions={
        <div className="flex gap-4 justify-end">
          <Button
            label="Huỷ"
            variant="secondary"
            onClick={onClose}
            rounded='lg'
            className='min-w-[150px]'
          />
          <Button
            label={loading ? "Đang tạo..." : "Tạo"}
            onClick={handleCreate}
            rounded='lg'
            className='min-w-[150px]'
          />
        </div>
      }
    />
  );
};

export default CreatePlantModal;