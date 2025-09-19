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
          className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SideContentPanel;
