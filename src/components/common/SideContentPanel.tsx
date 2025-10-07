// src/components/layout/SideContentPanel.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SideContentPanelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SideContentPanel: React.FC<SideContentPanelProps> = ({ open, onClose, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="fixed top-0 right-0 h-full w-full max-w-xl bg-mesh border-l border-gray-200 dark:border-white/5 shadow-2xl z-50 flex flex-col"
        >
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SideContentPanel;
