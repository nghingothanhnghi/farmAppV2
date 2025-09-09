/* components/layout/MainLayout.tsx*/
import React from 'react';
import { Outlet } from "react-router";
import SideMenu from './SideMenu';
import MobileTopBar from './MobileTopBar';
import DesktopSidebarToggleButton from './DesktopSidebarToggleButton';
import { useSidebar } from '../../hooks/useSidebar';


const MainLayout: React.FC = () => {
  const { menuOpen, setMenuOpen, handleMenuClose } = useSidebar();

  return (
    <div className="min-h-screen bg-mesh">
      <div className="flex flex-col lg:flex lg:flex-1 min-h-screen">
        {/* Mobile toggle button */}
        <MobileTopBar onMenuClick={() => setMenuOpen(true)} />
        <SideMenu open={menuOpen} onClose={handleMenuClose} />
        {/* open menu on desktop */}
        {!menuOpen && (
          <DesktopSidebarToggleButton onClick={() => setMenuOpen(true)} />
        )}

        <div
          className={`flex flex-1 flex-col pb-2 lg:min-w-0 lg:pt-2 lg:pr-2 transition-all duration-300 ${
            menuOpen ? "lg:pl-64" : "lg:pl-18"
          }`}
        >
          <div className="grow p-6 lg:rounded-3xl lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
            {/* Router children go here */}
            <Outlet />
          </div>
          <footer>
            <div className="max-w-7xl mx-auto pt-3 pb-1 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-xs text-gray-500">
                &copy; {new Date().getFullYear()}. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;