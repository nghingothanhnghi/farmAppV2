// src/components/common/CameraControls.tsx
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { IconArrowUp, IconArrowDown, IconArrowLeft, IconArrowRight, IconCrosshair } from "@tabler/icons-react";
import { motion } from "framer-motion";
import type { Direction, CameraControlsProps } from "../../models/interfaces/Camera";

const btnBase =
  "flex items-center justify-center rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";

const padBtn =
  "w-6 h-6 sm:w-8 sm:h-8 active:scale-[.98] transition-transform bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800";

const actionBtn =
  "px-3 py-1.5 h-8 rounded-xl text-xs font-medium bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800";

const labelCls = "text-xs text-zinc-500 dark:text-zinc-400";

export default function CameraControls({
  powered: poweredProp,
  onPowerChange,
  onMove,
  step: stepProp = 10,
  stepRange = { min: 1, max: 45 },
  disabled,
  className,
}: CameraControlsProps) {
  const isControlled = typeof poweredProp === "boolean";
  const [poweredUncontrolled, setPoweredUncontrolled] = useState<boolean>(poweredProp ?? false);
  const powered = isControlled ? (poweredProp as boolean) : poweredUncontrolled;

  const [step, setStep] = useState<number>(stepProp);
  const minStep = stepRange.min ?? 1;
  const maxStep = stepRange.max ?? 45;

  useEffect(() => {
    setStep(stepProp);
  }, [stepProp]);

  const togglePower = useCallback(() => {
    if (disabled) return;
    const next = !powered;
    if (!isControlled) setPoweredUncontrolled(next);
    onPowerChange?.(next);
  }, [disabled, powered, isControlled, onPowerChange]);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (disabled || !powered) return;
      onMove?.(direction, step);
    },
    [disabled, powered, onMove, step]
  );

  // Keyboard navigation: arrows, C=center, P=power
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          handleMove("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          handleMove("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleMove("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          handleMove("right");
          break;
        case "c":
        case "C":
          e.preventDefault();
          handleMove("center");
          break;
        case "p":
        case "P":
          e.preventDefault();
          togglePower();
          break;
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [disabled, togglePower, handleMove]);


  const nudge = useMemo(
    () => (
      <div className="grid grid-cols-3 grid-rows-3 gap-2 place-items-center mx-auto max-w-[124px]">
        <div />
        <motion.button
          type="button"
          aria-label="Move up"
          className={`${btnBase} ${padBtn}`}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleMove("up")}
        >
          <IconArrowUp />
        </motion.button>
        <div />

        <motion.button
          type="button"
          aria-label="Move left"
          className={`${btnBase} ${padBtn}`}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleMove("left")}
        >
          <IconArrowLeft />
        </motion.button>

        <motion.button
          type="button"
          aria-label="Center"
          className={`${btnBase} ${padBtn}`}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleMove("center")}
        >
          <IconCrosshair />
        </motion.button>

        <motion.button
          type="button"
          aria-label="Move right"
          className={`${btnBase} ${padBtn}`}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleMove("right")}
        >
          <IconArrowRight/>
        </motion.button>

        <div />
        <motion.button
          type="button"
          aria-label="Move down"
          className={`${btnBase} ${padBtn}`}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleMove("down")}
        >
          <IconArrowDown />
        </motion.button>
        <div />
      </div>
    ),
    [handleMove]
  );

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={` ${className ?? ""
      }`}
    >

      {/* D-Pad */}
      <div className={`opacity-${powered ? "100" : "60"}`}>
        {nudge}
      </div>

      {/* Footer Controls */}
      <div className="grid grid-cols-2 gap-3 items-center">
        <div className="flex items-center gap-3">
          <label className={labelCls}>Step</label>
          <input
            type="range"
            min={minStep}
            max={maxStep}
            value={step}
            onChange={(e) => setStep(parseInt(e.currentTarget.value))}
            className="w-full accent-indigo-600"
            aria-label="Move step"
            disabled={disabled}
          />
          <span className="text-sm tabular-nums w-10 text-right">{step}</span>
        </div>

        <div className="justify-self-end">
          <motion.button
            type="button"
            className={`${btnBase} ${actionBtn}`}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleMove("center")}
            disabled={disabled || !powered}
          >
            Center
          </motion.button>
        </div>
      </div>

      {/* Hints */}
      {/* <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
        Shortcuts: ← ↑ → ↓ to move • C to center • P to power toggle
      </p> */}
    </div>
  );
}