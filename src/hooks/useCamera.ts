// src/hooks/useCamera.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import type { RefObject } from "react";

interface UseCameraOptions {
  videoRef?: RefObject<HTMLVideoElement | null>;
  location?: string; // Optional: for logging or future device mapping
  facingMode?: 'user' | 'environment'; // Optional: default is 'environment'
  autoStart?: boolean;
}

export const useCamera = ({
  videoRef,
  location,
  facingMode = 'environment',
  autoStart = false,
}: UseCameraOptions) => {
  const internalRef = useRef<HTMLVideoElement | null>(null);
  const targetRef = videoRef ?? internalRef;
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null); // 👈 track in-flight play()

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      };

      console.log(`Starting camera for location: ${location ?? 'unknown'}`);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (targetRef.current) {
        targetRef.current.srcObject = stream;
        // Play must be called inside the same click gesture
        targetRef.current.muted = true; // ensure autoplay allowed
        playPromiseRef.current = targetRef.current.play();
        await playPromiseRef.current;
        playPromiseRef.current = null;
      }

      setIsStreaming(true);
    } catch (err: any) {
      // Benign: play() was interrupted by a near-simultaneous stopCamera()
      // (common in React 18 StrictMode's mount→cleanup→mount dev cycle,
      // or fast start/stop toggling). Nothing to actually recover from here.
      if (err?.name === 'AbortError') {
        console.warn('Camera play() was interrupted — likely a rapid start/stop, ignoring.');
        return;
      }
      console.error("Camera setup failed:", err);
      setIsStreaming(false);
    }
  }, [facingMode, location, targetRef]);

  const stopCamera = useCallback(async () => {
    // Let any in-flight play() settle before touching srcObject/tracks,
    // otherwise the browser throws the AbortError you're seeing.
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // already aborted/failed — nothing to clean up from it
      }
      playPromiseRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (targetRef.current) {
      targetRef.current.pause();
      targetRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, [targetRef]);

  useEffect(() => {
    if (autoStart) startCamera();
    return () => {
      stopCamera();
    };
  }, [autoStart, startCamera, stopCamera]);

  return { isStreaming, videoRef: targetRef, startCamera, stopCamera };
};

