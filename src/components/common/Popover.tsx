// src/components/common/Popover.tsx
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface PopoverProps {
  open: boolean;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
  placement?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  showArrow?: boolean;
}

export function Popover({
  open,
  anchorX,
  anchorY,
  onClose,
  placement = "top",
  children,
  showArrow = true,
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  let translate = "";
  if (placement === "top") translate = "translate(-50%, -100%)";
  if (placement === "bottom") translate = "translate(-50%, 0)";
  if (placement === "left") translate = "translate(-100%, -50%)";
  if (placement === "right") translate = "translate(0, -50%)";

  return createPortal(
    <div
      ref={popoverRef}
      className="absolute z-[9999] bg-white shadow-lg rounded-xl p-3 text-sm border border-gray-200 dark:bg-zinc-900 dark:border-white/10 dark:ring-white/10"
      style={{
        left: anchorX,
        top: anchorY,
        transform: translate,
        position: "fixed", // fixed is important so it positions relative to viewport
        minWidth: "200px",
        maxWidth: "300px",
      }}
    >
      {showArrow && (
        <div
          className="absolute w-3 h-3 bg-white border border-gray-200 dark:bg-zinc-900 dark:border-white/10 dark:ring-white/10 rotate-45"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            [placement === "top" ? "bottom" : "top"]: "-6px",
          }}
        />
      )}
      {children}
    </div>,
    document.body
  );
}
