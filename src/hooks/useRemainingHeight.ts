import { useEffect, useRef, useState } from "react";

export function useRemainingHeight(
  bottomOffset = 0,
  minHeight = 0
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;

    const updateHeight = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();

        const availableHeight =
          window.innerHeight - rect.top - bottomOffset;

        setHeight(Math.max(minHeight, availableHeight));
      });
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);

    const resizeObserver = new ResizeObserver(updateHeight);

    if (element.parentElement) {
      resizeObserver.observe(element.parentElement);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateHeight);
      resizeObserver.disconnect();
    };
  }, [bottomOffset, minHeight]);

  return { ref, height };
}