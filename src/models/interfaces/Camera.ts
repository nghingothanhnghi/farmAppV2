// src/models/interfaces/Camera.ts
export interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}
export interface DetectionResult {
  detections?: Detection[];
  annotated_image?: string;
  error?: string;
}
export interface ARCameraProps {
  modelName?: string;
  captureInterval?: number;
  streamMode?: 'websocket' | 'http';
  showAnnotatedImage?: boolean;
  onDetection?: (result: DetectionResult) => void;
  onError?: (message: string) => void;
}

export type Direction = "up" | "down" | "left" | "right" | "center";
export interface CameraControlsProps {
  /** Controlled power state (optional). If omitted, component manages its own state */
  powered?: boolean;
  /** Called when power state changes */
  onPowerChange?: (powered: boolean) => void;
  /** Called when a move is requested. step is the current step value (degrees or units) */
  onMove?: (direction: Direction, step: number) => void;
  /** Initial/default step if uncontrolled (e.g. degrees per nudge) */
  step?: number;
  /** Minimum and maximum step values */
  stepRange?: { min?: number; max?: number };
  /** Disable all controls */
  disabled?: boolean;
  /** Extra className for outer container */
  className?: string;
}