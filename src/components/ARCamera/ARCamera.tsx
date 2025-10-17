// src/components/ARCamera/ARCamera.tsx
// It provides a React component for augmented reality camera functionality,

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useAlert } from '../../contexts/alertContext';
import { objectDetectionService } from '../../services/objectDetectionService';
import { useCamera } from '../../hooks/useCamera';
import { useStreaming } from '../../hooks/useStreaming';
import DetectionOverlay from './components/DetectionOverlay';
import AnnotatedImage from './components/AnnotatedImage';
import ModelSelector from './components/ModelSelector';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { IconAlertCircle } from '@tabler/icons-react';
import type { ARCameraProps, Detection, DetectionResult } from '../../models/interfaces/Camera';

const ARCamera: React.FC<ARCameraProps> = ({ modelName = 'default', captureInterval = 500, onDetection, streamMode = 'http', showAnnotatedImage = true }) => {
  const { setAlert } = useAlert();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isStreaming } = useCamera({ videoRef, facingMode: 'user', autoStart: true });
  const [detections, setDetections] = useState<Detection[]>([]);
  const [annotatedImageSrc, setAnnotatedImageSrc] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState(modelName);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await objectDetectionService.listAvailableModels();
        setAvailableModels(models);
      } catch (err) {
        setAlert({ message: 'Could not fetch available models.', type: 'error' });
      }
    };

    fetchModels();
  }, []);


  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!video || !canvas || !context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1] || null;
  }, []);

  const processDetectionResults = (results: DetectionResult) => {
    if (results.detections) setDetections(results.detections);
    if (results.annotated_image && showAnnotatedImage)
      setAnnotatedImageSrc(`data:image/jpeg;base64,${results.annotated_image}`);
    onDetection?.(results);
  };

  useStreaming({ streamMode, captureInterval, selectedModel, captureFrame, isStreaming, processDetectionResults, setAlert });

  const confirmDeleteModel = (modelName: string) => {
    setModelToDelete(modelName);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!modelToDelete) return;
    try {
      await objectDetectionService.deleteModelByName(modelToDelete);
      const models = await objectDetectionService.listAvailableModels();
      setAvailableModels(models);
      setAlert({ message: `Model '${modelToDelete}' deleted successfully`, type: 'success' });
      if (selectedModel === modelToDelete) setSelectedModel('default');
    } catch {
      setAlert({ message: `Failed to delete model '${modelToDelete}'`, type: 'error' });
    } finally {
      setConfirmModalOpen(false);
      setModelToDelete(null);
    }
  };

  console.log("Available models:", availableModels);

  return (
    <div className='flex flex-col lg:flex-row gap-6'>
      <div className="camera-view flex-1">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <DetectionOverlay detections={detections} />
        {showAnnotatedImage && annotatedImageSrc && <AnnotatedImage src={annotatedImageSrc} />}
      </div>

      <div className='lg:w-[350px] space-y-2 flex flex-col max-h-full'>
        <ModelSelector
          availableModels={availableModels}
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
          onDeleteRequest={confirmDeleteModel}
        />
      </div>
      <Modal
        showCloseButton={false}
        size="xsmall"
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setModelToDelete(null);
        }}
        content={
          <div className="text-sm px-10 pt-6 pb-10 text-center">
            <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
            Are you sure you want to delete model{' '}
            <strong>{modelToDelete}</strong>?
          </div>
        }
        actions={
          <div className="flex gap-4 justify-center">
            <Button
              label="Yes, Delete"
              variant="danger"
              onClick={handleConfirmDelete}
              className="min-w-[150px]"
              rounded='lg'
            />
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => {
                setConfirmModalOpen(false);
                setModelToDelete(null);
              }}
              className="min-w-[150px]"
              rounded='lg'
            />
          </div>
        }
      />
    </div>
  );
};

export default ARCamera;
