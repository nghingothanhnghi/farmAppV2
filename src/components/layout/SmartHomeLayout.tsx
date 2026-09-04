// src/components/layout/SmartHomeLayout.tsx
import React from 'react';
import { Outlet } from 'react-router';

/**
 * Standalone layout for the Smart Home view.
 * No sidebar, no dashboard chrome — just a clean full-screen surface,
 * similar to how iOS Home app opens outside of any nested navigation.
 */
const SmartHomeLayout: React.FC = () => {
  return (
    <main className="min-h-screen bg-mesh text-zinc-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <Outlet />
      </div>
    </main>
  );
};

export default SmartHomeLayout;