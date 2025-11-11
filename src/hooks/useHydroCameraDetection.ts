// src/hooks/useHydroCameraDetection.ts
import { useRef, useState, useEffect, useCallback } from 'react';
import { useCamera } from './useCamera';
import { useStreaming } from './useStreaming';
import { useHydroSystem } from './useHydroSystem';
import type { DetectionResult, Detection } from '../models/interfaces/Camera';
import { classToHardwareType, hardwareColors } from '../utils/hardwareMappings';
import { OBJECT_DETECTION_STREAM_MODE, OBJECT_DETECTION_CAPTURE_INTERVAL, OBJECT_DETECTION_MODEL_NAME } from '../config/constants';

export const useHydroCameraDetection = (location?: string) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(null);
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
  const lastSyncRef = useRef<number>(0);
  const hasSyncedRef = useRef<string | null>(null);

  const { isStreaming, startCamera, stopCamera } = useCamera({ videoRef, location, facingMode: 'environment',  autoStart: false });
  const { actions, hardwareDetections, locationStatus, loading, error } = useHydroSystem();

    // derive the current location status (or undefined if not yet loaded)
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
      const w = x2 - x1;
      const h = y2 - y1;
      const hwType = classToHardwareType[det.class] ?? 'other';
      const color = (hardwareColors.canvas as any)[hwType] || hardwareColors.canvas.other;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, w, h);

      const label = `${det.class} (${Math.round(det.confidence * 100)}%)`;
      ctx.font = '14px Arial';
      const textWidth = ctx.measureText(label).width;
      const textHeight = 20;
      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textHeight - 4, textWidth + 8, textHeight + 4);
      ctx.fillStyle = 'white';
      ctx.fillText(label, x1 + 4, y1 - 8);
    });
  }, []);

  const normalizeDetections = (res: DetectionResult): Detection[] => {
    const raw = (res as any)?.detections || [];
    return raw.map((d: any) => {
      const cls = d.class ?? d.class_name ?? d.original_class ?? 'unknown';
      let bbox = d.bbox;
      if (Array.isArray(bbox) && bbox.length === 4) {
        const [x, y, w, h] = bbox.map(Number);
        bbox = [x, y, x + w, y + h];
      } else if (d.bbox_x1 != null && d.bbox_y1 != null && d.bbox_x2 != null && d.bbox_y2 != null) {
        bbox = [Number(d.bbox_x1), Number(d.bbox_y1), Number(d.bbox_x2), Number(d.bbox_y2)];
      }
      return { class: String(cls), confidence: Number(d.confidence ?? d.score ?? 0), bbox };
    });
  };

  const processDetectionResults = useCallback((result: DetectionResult) => {
    if (!result) return;
    const detections = normalizeDetections(result);
    setCurrentDetections(detections);
    drawBoundingBoxes(detections);

    const detectionId = (result as any).detection_id;
    if (detectionId && location) {
      (async () => {
        try {
          await actions.processDetectionResult(detectionId, location, 'camera_by_location', 0.6);
          const now = Date.now();
          if (now - lastSyncRef.current > 10000) {
            lastSyncRef.current = now;
            await actions.syncLocationInventory(location);
            await Promise.all([
              actions.fetchLocationStatus(location),
              actions.fetchHardwareDetections(location),
            ]);
          }
        } catch (e) {
          console.warn('Post-process sync failed:', e);
        }
      })();
    }
  }, [actions, location, drawBoundingBoxes]);

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
        await actions.syncLocationInventory(location);
        await Promise.all([
          actions.fetchLocationStatus(location),
          actions.fetchHardwareDetections(location),
        ]);
      } catch (e) {
        console.warn('Initial sync failed:', e);
      } finally {
        hasSyncedRef.current = location;
      }
    })();
  }, [location, actions]);

  return {
    videoRef,
    canvasRef,
    alert,
    loading,
    error,
    currentDetections,
    storedDetections: hardwareDetections,
    currentLocationStatus,
    // 👇 controls
    isCameraEnabled: isStreaming,
    initializeCamera: startCamera,
    stopCamera,
  };
};