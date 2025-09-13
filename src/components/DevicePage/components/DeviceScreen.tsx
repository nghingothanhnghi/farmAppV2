import React, { useEffect } from 'react';
import { useScreenStream } from '../../../hooks/useScreenStream';
import Button from '../../common/Button';
import DeviceInteraction from './DeviceInteraction';
import LinearProgress from '../../common/LinearProgress';

interface DeviceScreenProps {
  deviceSerial: string;
  onClose?: () => void;
}

const DeviceScreen: React.FC<DeviceScreenProps> = ({ deviceSerial, onClose }) => {
  const {
    currentFrame,
    isStreaming,
    loading,
    error,
    takeScreenshot,
    startStream,
    stopStream
  } = useScreenStream(deviceSerial);

  // Take a screenshot when component mounts
  useEffect(() => {
    if (deviceSerial && !isStreaming) {
      takeScreenshot();
    }
  }, [deviceSerial, takeScreenshot, isStreaming]);

  const handleToggleStream = () => {
    if (isStreaming) {
      stopStream();
    } else {
      startStream();
    }
  };

  const handleRefresh = () => {
    if (!isStreaming) {
      takeScreenshot();
    }
  };

  return (
    <div className="bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-700 shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Device Screen</h2>
            <div className="text-xs text-gray-500 flex items-center mt-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Interactive: Tap or swipe on screen
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-4">
          <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-100" style={{ minHeight: '630px', minWidth: '200px' }}>
            {loading ? (
              <LinearProgress
                position="absolute" // or 'fixed' if you want it on top of screen
                thickness="h-1"
                duration={3000} // adjust as needed
                message="Loading device screens..."
              />
            ) : currentFrame ? (
              <div className="relative">
                <img
                  src={`data:image/jpeg;base64,${currentFrame}`}
                  alt="Device Screen"
                  className="max-w-full h-auto"
                />
                <div className="absolute inset-0">
                  <DeviceInteraction
                    deviceSerial={deviceSerial}
                    imageWidth={1080} // Default width, adjust as needed
                    imageHeight={2340} // Default height, adjust as needed
                  />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                No screen data available
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          <Button
            label={isStreaming ? "Stop Stream" : "Start Stream"}
            onClick={handleToggleStream}
            variant={isStreaming ? "danger" : "primary"}
            disabled={loading}
            rounded='lg'
          />
          {!isStreaming && (
            <Button
              label="Refresh"
              onClick={handleRefresh}
              variant="secondary"
              disabled={loading}
              rounded='lg'
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceScreen;