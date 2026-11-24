// src/hooks/useSidebar.ts

import { useEffect, useState, useCallback, useRef } from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebarOpen';
const DESKTOP_BREAKPOINT = 1024;

export function useSidebar(
  defaultOpenDesktop = true,
  persist = true
) {
  const [menuOpen, setMenuOpenState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    if (persist) {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);

      if (saved !== null) {
        try {
          return JSON.parse(saved);
        } catch {
          localStorage.removeItem(SIDEBAR_STORAGE_KEY);
        }
      }
    }

    return window.innerWidth >= DESKTOP_BREAKPOINT
      ? defaultOpenDesktop
      : false;
  });

  const isUserToggled = useRef(false);

  // Centralized state setter
  const setMenuOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      isUserToggled.current = true;
      setMenuOpenState(value);
    },
    []
  );

  // Persist sidebar state
  useEffect(() => {
    if (persist) {
      localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        JSON.stringify(menuOpen)
      );
    }
  }, [menuOpen, persist]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;

      if (!isDesktop) {
        isUserToggled.current = false;
        setMenuOpenState(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Explicit close handler
  const handleMenuClose = useCallback(() => {
    setMenuOpenState(false);
    isUserToggled.current = true;
  }, []);

  // Explicit toggle handler
  const toggleMenu = useCallback(() => {
    setMenuOpenState((prev) => !prev);
    isUserToggled.current = true;
  }, []);

  return {
    menuOpen,
    setMenuOpen,
    handleMenuClose,
    toggleMenu,
  };
}
