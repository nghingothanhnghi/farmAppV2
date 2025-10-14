// src/hooks/useSideContent.ts
import { useState } from "react";

export function useSideContent(defaultOpen = false) {
  const [sideOpen, setSideOpen] = useState(defaultOpen);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  // ✅ make node optional
  const openSide = (node?: React.ReactNode) => {
    if (node) setContent(node);
    setSideOpen(true);
  };

  const closeSide = () => {
    setSideOpen(false);
    setContent(null);
  };

  return {
    sideOpen,
    content,
    openSide,
    closeSide,
  };
}
