import { useEffect, useRef, useState } from "react";

export function useRemainingHeight(
  bottomOffset = 0,
  minHeight = 200
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const updateHeight = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();

      const availableHeight =
        window.innerHeight - rect.top - bottomOffset;

      setHeight(Math.max(minHeight, availableHeight));
    };

    // Calculate after the current layout has been rendered
    const frame = requestAnimationFrame(updateHeight);

    window.addEventListener("resize", updateHeight);

    // Watch for changes to the layout above the grid
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateHeight);
    });

    if (ref.current?.parentElement) {
      resizeObserver.observe(ref.current.parentElement);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateHeight);
      resizeObserver.disconnect();
    };
  }, [bottomOffset, minHeight]);

  
  return {
    ref,
    height,
  };
}