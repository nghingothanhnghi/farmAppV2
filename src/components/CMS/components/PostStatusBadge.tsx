// src/components/CMS/components/PostStatusBadge.tsx

import Badge from "../../common/Badge";
import type { PostStatus } from "../../../models/interfaces/Post";
import { getPostStatus } from "../../../utils/post";

interface Props {
  status: PostStatus;
}

export default function PostStatusBadge({ status }: Props) {
  

  const { label, variant } = getPostStatus(status);

  return (
    <Badge
      label={label}
      variant={variant}
    />
  );
}