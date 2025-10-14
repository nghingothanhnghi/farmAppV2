// src/hooks/useScrollToSection.ts
import { useCallback } from 'react';

interface ScrollOptions {
  offset?: number;          // optional offset for fixed headers
  smooth?: boolean;         // smooth scroll
  onAfterScroll?: () => void; // callback after scroll (e.g. close menu)
}

/**
 * Provides a reusable scrollToSection function
 * that scrolls smoothly to a given section by ID.
 */
export function useScrollToSection(options: ScrollOptions = {}) {
  const { offset = 0, smooth = true, onAfterScroll } = options;

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top,
      behavior: smooth ? 'smooth' : 'auto',
    });

    if (onAfterScroll) onAfterScroll();
  }, [offset, smooth, onAfterScroll]);

  return scrollToSection;
}

