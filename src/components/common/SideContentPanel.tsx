// src/components/layout/SideContentPanel.tsx
import React from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

interface SideContentPanelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerActions?: React.ReactNode;
}

const SideContentPanel: React.FC<SideContentPanelProps> = ({
  open,
  onClose,
  children,
  title,
  description,
  headerActions,
}) => {
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
            className="fixed inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-white/5 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-white/10">
              <Button
                variant="secondary"
                icon={<IconArrowLeft size={18} stroke={1.5} />}
                iconOnly
                label="Close"
                className='shrink-0 bg-transparent'
                onClick={onClose}
                rounded='full'
              />


              {(title || description) && (
                <div className="min-w-0 flex-1 space-y-1">
                  {title && (
                    typeof title === "string" ? (
                      <h3 className="truncate font-medium text-sm text-gray-900 dark:text-white">
                        {title}
                      </h3>
                    ) : (
                      title
                    )
                  )}

                  {description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {description}
                    </div>
                  )}
                </div>
              )}


              {headerActions && (
                <div className="flex shrink-0 items-center gap-2">
                  {headerActions}
                </div>
              )}

            </div>
            <div
              className="flex-1 overflow-y-auto overscroll-contain touch-pan-y"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideContentPanel;
