// src/components/ARDetectionPage/ARDetectionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import ARCamera from '../ARCamera';
import type { DetectionResult, Detection } from '../../models/interfaces/Camera';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import './ARDetectionPage.css';

const ARDetectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [detectionResults, setDetectionResults] = useState<DetectionResult | null>(null);
  const [streamMode, setStreamMode] = useState<'websocket' | 'http'>('http');
  const [captureInterval, setCaptureInterval] = useState<number>(500);
  const [modelName, setModelName] = useState<string>('default');
  const [showAnnotatedImage, setShowAnnotatedImage] = useState<boolean>(true);
  const [showModelSelector, setShowModelSelector] = useState<boolean>(false);

  const handleDetection = (results: any) => {
    setDetectionResults(results);
  };

  const handleStreamModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStreamMode(e.target.value as 'websocket' | 'http');
  };

  const handleCaptureIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptureInterval(parseInt(e.target.value));
  };

  const handleModelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelName(e.target.value);
  };

  const handleShowAnnotatedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAnnotatedImage(e.target.checked);
  };

  const toggleModelSelector = () => {
    setShowModelSelector(!showModelSelector);
  };

  return (
    <div className="ar-detection-page">
      <PageTitle
        title="AR Object Detection"
        actions={
          <>
            <Button
              label="Train Custom Model"
              onClick={() => navigate('/model-training')}
              variant="secondary"
              rounded='lg'
            />
            <Button
              label={showModelSelector ? 'Hide Model Options' : 'Show Model Options'}
              onClick={toggleModelSelector}
              variant="secondary"
              rounded='lg'
            />
          </>
        }
      />

      {showModelSelector && (
        <div className="settings-panel expanded">
          <div className="setting-group">
            <label htmlFor="streamMode">Stream Mode:</label>
            <select
              id="streamMode"
              value={streamMode}
              onChange={handleStreamModeChange}
            >
              <option value="http">HTTP</option>
              <option value="websocket">WebSocket</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="captureInterval">Capture Interval (ms):</label>
            <input
              type="number"
              id="captureInterval"
              value={captureInterval}
              onChange={handleCaptureIntervalChange}
              min="100"
              max="2000"
              step="100"
            />
          </div>

          <div className="setting-group">
            <label htmlFor="modelName">Model Name:</label>
            <input
              type="text"
              id="modelName"
              value={modelName}
              onChange={handleModelNameChange}
              placeholder="default"
            />
            <small className="model-hint">
              Enter "default" for built-in model or the name of your trained model
            </small>
          </div>

          <div className="setting-group checkbox">
            <label htmlFor="showAnnotatedImage">
              <input
                type="checkbox"
                id="showAnnotatedImage"
                checked={showAnnotatedImage}
                onChange={handleShowAnnotatedImageChange}
              />
              Show Annotated Image
            </label>
          </div>
        </div>
      )}

      <div className="camera-container">
        <ARCamera
          modelName={modelName}
          captureInterval={captureInterval}
          onDetection={handleDetection}
          streamMode={streamMode}
          showAnnotatedImage={showAnnotatedImage}
        />
      </div>

      {detectionResults?.detections && (
        <div className=" bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-6">
          <h3 className='text-sm font-medium text-gray-700 dark:text-gray-100 line-clamp-1'>Detection Results</h3>
          <div className="mt-0.5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {detectionResults.detections.map((detection: Detection, index: number) => (
              <div key={index} className="
              flex flex-col items-start rounded-xl p-3 
            bg-gradient-to-tr from-indigo-50 to-white 
          dark:from-indigo-900/20 dark:to-gray-900 
            border border-gray-200 dark:border-gray-700 
            inset-shadow-sm hover:shadow-md transition">
                <div className="detection-class text-sm font-medium">{detection.class_name}</div>
                <div className="detection-confidence text-xs">
                  Confidence: {(detection.confidence * 100).toFixed(2)}%
                </div>
                <div className="text-[0.625rem] text-gray-500 dark:text-gray-400 mt-1">
                  Bounding Box: [{detection.bbox.map((val: number) => val.toFixed(1)).join(', ')}]
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ARDetectionPage;