import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorProps, setIndicatorProps] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [searchParams, setSearchParams] = useSearchParams();

  // Read ?tab= from URL on mount and sync with parent
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      onTabChange(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL when activeTab changes
  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", activeTab);
      return newParams;
    });
  }, [activeTab, setSearchParams]);

  // Recalculate indicator position when activeTab changes
  useEffect(() => {
    if (!containerRef.current) return;

    const activeButton = containerRef.current.querySelector<HTMLButtonElement>(
      `button[data-id="${activeTab}"]`
    );

    if (activeButton) {
      const { offsetLeft, offsetWidth } = activeButton;
      setIndicatorProps({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab, tabs]);
  return (
    <React.Fragment>
      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-white/5">
        <nav ref={containerRef} className="relative -mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-id={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-2 px-1 font-medium text-sm cursor-pointer focus:outline-none flex flex-col sm:flex-row items-center sm:gap-2 gap-1 transition-colors ${activeTab === tab.id
                ? "text-orange-600 dark:text-gray-100"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
          {/* Animated border indicator */}
          <motion.div
            className="absolute bottom-0 h-0.5 bg-orange-600 rounded-full"
            layout
            animate={{
              left: indicatorProps.left,
              width: indicatorProps.width,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
        </nav>
      </div>
      {/* Tab content */}
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </React.Fragment>
  );
};

export default Tabs;
