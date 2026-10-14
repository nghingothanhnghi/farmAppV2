// src/hooks/useHydroCameraDetection.ts
import { useRef, useState, useEffect, useCallback } from 'react';
import { useCamera } from './useCamera';
import { useStreaming } from './useStreaming';
import type { useHydroSystem } from './useHydroSystem';
import type { DetectionResult, Detection } from '../models/interfaces/Camera';
import { classToHardwareType, hardwareColors } from '../utils/hardwareMappings';
import { OBJECT_DETECTION_STREAM_MODE, OBJECT_DETECTION_CAPTURE_INTERVAL, OBJECT_DETECTION_MODEL_NAME } from '../config/constants';

// Contract: bbox is [x1, y1, x2, y2]. Malformed boxes are dropped, never drawn.
const normalizeBBox = (d: any): Detection['bbox'] | null => {
  const raw =
    Array.isArray(d.bbox) && d.bbox.length === 4
      ? d.bbox
      : d.bbox_x1 != null && d.bbox_y1 != null && d.bbox_x2 != null && d.bbox_y2 != null
        ? [d.bbox_x1, d.bbox_y1, d.bbox_x2, d.bbox_y2]
        : null;
  if (!raw) return null;
  const [x1, y1, x2, y2] = raw.map(Number);
  if ([x1, y1, x2, y2].some((n) => !Number.isFinite(n)) || x2 <= x1 || y2 <= y1) return null;
  return [x1, y1, x2, y2];
};

const normalizeDetections = (res: DetectionResult): Detection[] =>
  ((res as any)?.detections ?? []).flatMap((d: any) => {
    const bbox = normalizeBBox(d);
    if (!bbox) return [];
    return [{
      class: String(d.class ?? d.class_name ?? d.original_class ?? 'unknown'),
      confidence: Number(d.confidence ?? d.score ?? 0),
      bbox,
    }];
  });

export const useHydroCameraDetection = (
  hydroSystem: ReturnType<typeof useHydroSystem>,
  location?: string
) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(null);
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
  const lastSyncRef = useRef<number>(0);
  const hasSyncedRef = useRef<string | null>(null);

  const { isStreaming, startCamera, stopCamera } = useCamera({ videoRef, location, facingMode: 'environment', autoStart: false });
  const { hardwareDetections, locationStatus, loading, error } = hydroSystem;
  const {
    processDetectionResult,
    syncLocationInventory,
    fetchLocationStatus,
    fetchHardwareDetections,
  } = hydroSystem.actions;

  const currentLocationStatus = location ? locationStatus[location] : undefined;

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const drawBoundingBoxes = useCallback((detections: Detection[]) => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      const hwType = classToHardwareType[det.class] ?? 'other';
      const color = (hardwareColors.canvas as any)[hwType] || hardwareColors.canvas.other;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      const label = `${det.class} (${Math.round(det.confidence * 100)}%)`;
      ctx.font = '14px Arial';
      const textWidth = ctx.measureText(label).width;
      const textHeight = 20;
      const labelY = Math.max(y1, textHeight + 4); // keep label inside the canvas
      ctx.fillStyle = color;
      ctx.fillRect(x1, labelY - textHeight - 4, textWidth + 8, textHeight + 4);
      ctx.fillStyle = 'white';
      ctx.fillText(label, x1 + 4, labelY - 8);
    });
  }, []);

  const processDetectionResults = useCallback((result: DetectionResult) => {
    if (!result) return;
    const detections = normalizeDetections(result);
    setCurrentDetections(detections);
    drawBoundingBoxes(detections);

    const detectionId = (result as any).detection_id;
    if (detectionId && location) {
      (async () => {
        try {
          await processDetectionResult(detectionId, location, 'camera_by_location', 0.6);
          const now = Date.now();
          if (now - lastSyncRef.current > 10000) {
            lastSyncRef.current = now;
            await syncLocationInventory(location);
            await Promise.all([
              fetchLocationStatus(location),
              fetchHardwareDetections(location),
            ]);
          }
        } catch (e) {
          console.warn('Post-process sync failed:', e);
        }
      })();
    }
  }, [location, drawBoundingBoxes, fetchHardwareDetections, fetchLocationStatus, processDetectionResult, syncLocationInventory]);

  useStreaming({
    streamMode: OBJECT_DETECTION_STREAM_MODE,
    captureInterval: OBJECT_DETECTION_CAPTURE_INTERVAL,
    selectedModel: OBJECT_DETECTION_MODEL_NAME,
    captureFrame,
    isStreaming,
    processDetectionResults,
    setAlert,
  });

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const handleResize = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        if (currentDetections.length > 0) drawBoundingBoxes(currentDetections);
      }
    };
    video.addEventListener('loadedmetadata', handleResize);
    video.addEventListener('resize', handleResize);
    return () => {
      video.removeEventListener('loadedmetadata', handleResize);
      video.removeEventListener('resize', handleResize);
    };
  }, [currentDetections, drawBoundingBoxes]);

  useEffect(() => {
    if (!location) return;
    if (hasSyncedRef.current === location) return;
    (async () => {
      try {
        await syncLocationInventory(location);
        await Promise.all([
          fetchLocationStatus(location),
          fetchHardwareDetections(location),
        ]);
      } catch (e) {
        console.warn('Initial sync failed:', e);
      } finally {
        hasSyncedRef.current = location;
      }
    })();
  }, [location, fetchHardwareDetections, fetchLocationStatus, syncLocationInventory]);

  return {
    videoRef,
    canvasRef,
    alert,
    loading,
    error,
    currentDetections,
    storedDetections: hardwareDetections,
    currentLocationStatus,
    isCameraEnabled: isStreaming,
    initializeCamera: startCamera,
    stopCamera,
  };
};