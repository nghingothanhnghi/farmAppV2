// src/utils/post.ts

import type { PostStatus, PostType } from "../models/interfaces/Post";
import {
  IconFile,
  IconFileText,
} from "@tabler/icons-react";


// =========================
// POST STATUS
// =========================

const postStatusConfig: Record<
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

export const getPostStatus = (status?: PostStatus) => {
  if (!status) {
    return {
      label: "Unknown",
      variant: "secondary" as const,
    };
  }

  return (
    postStatusConfig[status] ?? {
      label: status,
      variant: "secondary" as const,
    }
  );
};


// =========================
// POST TYPE
// =========================

const postTypeConfig: Record<
  PostType,
  {
    label: string;
    Icon: typeof IconFile;
  }
> = {
  post: {
    label: "Post",
    Icon: IconFileText,
  },
  page: {
    label: "Page",
    Icon: IconFile,
  },
};

export const getPostType = (type?: PostType) => {
  if (!type) {
    return {
      label: "Unknown",
      Icon: IconFile,
    };
  }

  return (
    postTypeConfig[type] ?? {
      label: type,
      Icon: IconFile,
    }
  );
};