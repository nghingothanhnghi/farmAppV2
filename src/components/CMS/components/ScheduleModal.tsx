// src/components/CMS/components/ScheduleModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { FormGroup, FormLabel, FormInput } from "../../common/Form";
import type { CmsPostListItem } from "../../../models/interfaces/Post";
import { isoToDatetimeLocal } from '../../../utils/formatters';

const isFuture = (localValue: string) => {
    const t = new Date(localValue).getTime();
    return !isNaN(t) && t > Date.now();
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    post: CmsPostListItem | null;
    onSubmit: (isoDate: string) => Promise<void>;
}


const ScheduleModal: React.FC<Props> = ({ isOpen, onClose, post, onSubmit }) => {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setValue(isoToDatetimeLocal(post?.scheduled_at));
            setTouched(false);
        }
    }, [isOpen, post]);

    // The backend rejects past times with 400; catch it here for instant feedback.
    const inPast = !!value && !isFuture(value);

    const handleSubmit = async () => {
        setTouched(true);
        if (!value || inPast) return;
        const iso = new Date(value).toISOString();

        try {
            setLoading(true);
            await onSubmit(iso);
            onClose();
        } catch {
            // the page already showed the error alert; keep the modal open
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Schedule "${post?.title ?? ""}"`}
            size="small"
            content={
                <div className="px-10 pb-4 space-y-4">
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="schedule_at">Publish at</FormLabel>
                        <FormInput
                            id="schedule_at"
                            type="datetime-local"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                setTouched(true);
                            }}
                            min={isoToDatetimeLocal(new Date().toISOString())}
                            required
                        />
                        {touched && inPast && (
                            <p className="text-xs text-red-500">Choose a time in the future.</p>
                        )}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            The post will automatically switch to "Published" at this local time.
                        </p>
                    </FormGroup>
                </div>
            }
            actions={
                <div className="flex gap-4">
                    <Button
                        label={loading ? "Scheduling..." : "Schedule"}
                        onClick={handleSubmit}
                        disabled={loading || !value || inPast}
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

export default ScheduleModal;