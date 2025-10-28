// src/components/layout/SideContentPanel.tsx
import React from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

interface SideContentPanelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SideContentPanel: React.FC<SideContentPanelProps> = ({ open, onClose, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 🔹 Backdrop Blur */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-dark border-l border-gray-200 dark:border-white/5 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4">
              <Button
                variant="secondary"
                icon={<IconArrowLeft size={18} stroke={1.5} />}
                iconOnly
                label="Close"
                className='bg-transparent'
                onClick={onClose}
                rounded='full'
              />
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideContentPanel;
