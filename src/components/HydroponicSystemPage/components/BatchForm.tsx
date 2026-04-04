// src/components/PlantBatch/components/BatchForm.tsx

import React from "react";
import type { PlantBatch } from "../../../models/interfaces/PlantBatch";
import Form, {
    FormGroup,
    FormLabel,
    FormInput,
    FormActions
} from "../../common/Form";
import Button from "../../common/Button";

type Props = {
    formData: Partial<PlantBatch>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    isEdit?: boolean;
    fieldErrors: Record<string, string>;
};

const BatchForm: React.FC<Props> = ({
    formData,
    onChange,
    onSubmit,
    loading,
    isEdit,
    fieldErrors
}) => {
    return (
        <Form onSubmit={onSubmit} className="max-w-xl mx-auto">
            <FormGroup>
                <FormLabel htmlFor="plant_id">Plant ID</FormLabel>
                <FormInput
                    type="text"
                    id="plant_id"
                    name="plant_id"
                    value={formData.plant_id || ''}
                    onChange={onChange}
                />
                {fieldErrors.plant_id && <p>{fieldErrors.plant_id}</p>}
            </FormGroup>

            <FormGroup>
                <FormLabel htmlFor="zone_id">Zone ID</FormLabel>
                <FormInput
                    id="zone_id"
                    type="text"
                    name="zone_id"
                    value={formData.zone_id || ''}
                    onChange={onChange}
                />
                {fieldErrors.zone_id && <p>{fieldErrors.zone_id}</p>}
            </FormGroup>

            <FormActions className="flex justify-end gap-4 mt-6">
                <Button label="Huỷ" variant="secondary" />
                <Button
                    type="submit"
                    label={
                        loading
                            ? "Đang lưu..."
                            : isEdit
                                ? "Cập nhật"
                                : "Tạo mới"
                    }
                />
            </FormActions>
        </Form>
    );
};

export default BatchForm;