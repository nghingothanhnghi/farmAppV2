// src/components/billiard/hooks/useNow.ts
import { useEffect, useState } from 'react';

/** Date.now() refreshed every `intervalMs` - drives the local 1s elapsed tick. */
export function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, enabled]);

  return now;
}
