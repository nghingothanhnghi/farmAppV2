// src/hooks/useAutoHideNavbar.ts
import { useEffect, useState, useCallback } from "react";

/**
 * Hook for showing/hiding navbar based on scroll direction
 * and position relative to a reference section (like "hero").
 *
 * Returns [showNavbar, showNow] so you can force it open.
 */
export function useAutoHideNavbar(triggerId: string = "hero", offset: number = 80) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const showNow = useCallback(() => setShowNavbar(true), []);

  useEffect(() => {
    const trigger = document.getElementById(triggerId);
    const triggerHeight = trigger ? trigger.offsetHeight : 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const goingDown = currentY > lastScrollY;

      // hide navbar when scrolling down past trigger
      if (goingDown && currentY > triggerHeight - offset) {
        setShowNavbar(false);
      } 
      // show when scrolling up or above trigger
      else if (!goingDown || currentY < triggerHeight - offset) {
        setShowNavbar(true);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, triggerId, offset]);

  return { showNavbar, showNow };
}

