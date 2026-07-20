// src/components/CMS/components/PostStatusBadge.tsx

import Badge from "../../common/Badge";
import type { PostStatus } from "../../../models/interfaces/Post";

interface Props {
  status: PostStatus;
}

const STATUS_CONFIG: Record<
  PostStatus,
  {
    label: string;
    variant: "success" | "warning" | "info" | "secondary";
  }
> = {
  draft: {
    label: "Draft",
    variant: "warning",
  },
  published: {
    label: "Published",
    variant: "success",
  },
  scheduled: {
    label: "Scheduled",
    variant: "info",
  },
  archived: {
    label: "Archived",
    variant: "secondary",
  },
};

export default function PostStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      label={config.label}
      variant={config.variant}
    />
  );
}