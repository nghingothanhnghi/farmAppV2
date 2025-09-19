// src/hooks/useSideContent.ts
import { useState } from "react";

export function useSideContent(defaultOpen = false) {
  const [sideOpen, setSideOpen] = useState(defaultOpen);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  const openSide = (node: React.ReactNode) => {
    setContent(node);
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
