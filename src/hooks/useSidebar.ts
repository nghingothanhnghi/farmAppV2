// src/hooks/useSidebar.ts
import { useEffect, useState, useRef } from 'react';

export function useSidebar(defaultOpenDesktop = true, persist = true) {
  const [menuOpen, setMenuOpen] = useState(() => {
    if (typeof window !== 'undefined') {
            if (persist) {
        const saved = localStorage.getItem('sidebarOpen');
        if (saved !== null) return JSON.parse(saved);
      }
      return window.innerWidth >= 1024 ? defaultOpenDesktop : false;
    }
    return false;
  });

  const isUserToggled = useRef(false);

  useEffect(() => {
    if (persist && typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpen', JSON.stringify(menuOpen));
    }
  }, [menuOpen, persist]);

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        if (!isUserToggled.current) {
          setMenuOpen(defaultOpenDesktop); // ✅ use the prop value, not always true
        }
      } else {
        setMenuOpen(false); // Always close on mobile
        isUserToggled.current = false; // Reset manual flag on mobile
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [defaultOpenDesktop]);

  const handleMenuClose = () => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 1024;
      isUserToggled.current = true; // 👈 Mark as manual toggle

      if (isDesktop) {
        setMenuOpen(!menuOpen); // toggle
      } else {
        setMenuOpen(false); // always close on mobile
      }
    }
  };

  return {
    menuOpen,
    setMenuOpen,
    handleMenuClose,
  };
}
