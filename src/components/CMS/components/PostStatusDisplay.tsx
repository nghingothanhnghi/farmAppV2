// src/components/CMS/components/PostStatusDisplay.tsx
import React from "react";
import { IconCalendarClock } from '@tabler/icons-react';
import { formatDateTime } from "../../../utils/formatters";
import PostStatusBadge from "./PostStatusBadge";
import type { PostStatus } from "../../../models/interfaces/Post";

interface PostStatusDisplayProps {
    status: PostStatus;
    scheduledAt?: string | null;
}

const PostStatusDisplay: React.FC<PostStatusDisplayProps> = ({
    status,
    scheduledAt,
}) => {
    return (
        <div className="py-1 whitespace-normal leading-tight">
            <PostStatusBadge status={status} />
            {status === "scheduled" && scheduledAt && (
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                    <IconCalendarClock size={10} />
                    <span>{formatDateTime(scheduledAt)}</span>
                </div>
            )}
        </div>
    );
};

export default PostStatusDisplay;