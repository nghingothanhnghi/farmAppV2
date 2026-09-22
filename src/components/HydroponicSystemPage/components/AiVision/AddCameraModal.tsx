import React, { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import Modal from "../../../common/Modal";
import Button from "../../../common/Button";
import { FormInput } from "../../../common/Form";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreateCamera: (
        name: string,
        url?: string
    ) => Promise<unknown>;
}

const AddCameraModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onCreateCamera,
}) => {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [saving, setSaving] = useState(false);

    const handleClose = () => {
        if (saving) return;

        setName("");
        setUrl("");
        onClose();
    };

    const handleSubmit = async () => {
        const cameraName = name.trim();

        if (!cameraName) return;

        setSaving(true);

        try {
            await onCreateCamera(
                cameraName,
                url.trim() || undefined
            );

            setName("");
            setUrl("");
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add new camera"
            size="small"
            content={
                <div className="px-6 pb-2 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add a camera to use for AI Vision
                            image analysis.
                        </p>
                    </div>

                    <FormInput
                        id="camera-name"
                        type="text"
                        placeholder="Camera name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        disabled={saving}
                    />

                    <FormInput
                        id="camera-url"
                        type="text"
                        placeholder="IP camera URL (optional)"
                        value={url}
                        onChange={(e) =>
                            setUrl(e.target.value)
                        }
                        disabled={saving}
                    />

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Example: rtsp://192.168.1.100:554/stream
                    </p>
                </div>
            }
            actions={
                <div className="flex justify-end gap-2">
                    <Button
                        label="Cancel"
                        variant="secondary"
                        size="sm"
                        rounded="lg"
                        disabled={saving}
                        onClick={handleClose}
                    />

                    <Button
                        label={saving ? "Saving..." : "Add camera"}
                        icon={<IconPlus size={14} />}
                        iconPosition="left"
                        size="sm"
                        rounded="lg"
                        disabled={
                            saving || !name.trim()
                        }
                        onClick={handleSubmit}
                    />
                </div>
            }
        />
    );
};

export default AddCameraModal;