// src/hooks/useRefetchOnFocus.ts
// Calls `refetch` when the tab becomes visible / the window regains focus.
// Used by the CMS post list so scheduled posts that went live in the background
// (backend publishes within ~60 s) show up without a manual reload.
import { useEffect, useRef } from 'react';

export function useRefetchOnFocus(refetch: () => void, minIntervalMs = 30_000, enabled = true) {
  const refetchRef = useRef(refetch);
  const lastRun = useRef(Date.now());

  // always call the latest callback without re-subscribing listeners
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      if (document.visibilityState === 'hidden') return;
      const now = Date.now();
      if (now - lastRun.current < minIntervalMs) return;
      lastRun.current = now;
      refetchRef.current();
    };

    window.addEventListener('focus', run);
    document.addEventListener('visibilitychange', run);
    return () => {
      window.removeEventListener('focus', run);
      document.removeEventListener('visibilitychange', run);
    };
  }, [minIntervalMs, enabled]);
}
