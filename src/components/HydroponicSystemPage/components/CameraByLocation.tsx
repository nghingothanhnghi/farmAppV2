// src/components/HydroponicSystemPage/components/CameraByLocation.tsx

import React from 'react';
import Spinner from '../../common/Spinner';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import { IconCameraCancel, IconPlayerPlay } from '@tabler/icons-react';
import RealtimeDetections from './RealtimeDetections';
import StoredDetections from './StoredDetections';
import LocationStatusOverview from './LocationStatusOverview';
import { useHydroCameraDetection } from '../../../hooks/useHydroCameraDetection';
import CameraControls from '../../common/CameraControls';
import type { Direction } from '../../../models/interfaces/Camera';
import { useHoverSlide } from '../../../hooks/useHoverSlide';
import { HoverSlideIn } from "../../common/HoverSlideIn";
import HydroFarmMapPanel from './HydroFarmMapPanel';

interface CameraByLocationProps {
  location?: string;
}

const CameraByLocation: React.FC<CameraByLocationProps> = ({ location }) => {

  const {
    videoRef,
    canvasRef,
    currentDetections,
    currentLocationStatus,
    storedDetections,
    loading,
    alert,
    isCameraEnabled,
    initializeCamera,
    stopCamera,
  } = useHydroCameraDetection(location);

  const { isHovered, bind } = useHoverSlide();
  // TODO: Replace with actual service call to move camera by direction/step
  const handleMove = React.useCallback(
    async (direction: Direction, step: number) => {
      // Example: call a PTZ endpoint or device service
      // await deviceService.moveCamera({ location, direction, step });
      console.log('Move camera:', { location, direction, step });
    },
    [location]
  );



  return (
    <div className="camera-by-location relative h-full">
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-3 h-full'>
        {/* Video and Canvas Container */}
        <div
          className="relative h-full flex flex-col row-span-2 col-span-2 rounded-lg overflow-hidden bg-gray-900"
          {...bind}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 rounded-lg">
              <Spinner size={48} colorClass="border-white" borderClass="border-4" />
            </div>
          )}
          {alert && (
            <div className={`alert alert-${alert.type} w-full text-center bottom-0 left-0 p-2 rounded bg-red-900 text-white font-bold text-sm absolute`}>
              {alert.message}
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px',
              display: 'block'
            }}
          />
          {/* Canvas overlay for bounding boxes */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
          {/* 🔹 Real-time detections overlay (top) */}
          <RealtimeDetections currentDetections={currentDetections} />
          {/* 🔹 Stored detections overlay (bottom) */}
          <StoredDetections hardwareDetections={storedDetections} location={location} />
          {/* 🔹 Controls camera turn left, right, etc... */}
          <HoverSlideIn isHovered={isHovered} from="right" className="absolute bottom-2 right-2 z-10">
            <CameraControls
              powered={isCameraEnabled}
              onMove={handleMove}
              step={10}                 // default nudge step
              stepRange={{ min: 1, max: 45 }}
              disabled={!location || loading}
              className="absolute bottom-2 right-2 z-10 w-[250px] height-[100px]"
            />
          </HoverSlideIn>
        </div>
        {/* Panel placeholders */}
        <div className="border border-gray-100 p-4 rounded-lg shadow bg-white h-full">
          <div className="flex flex-col items-center gap-2 mb-3">
            <div className="flex space-x-1 w-full">
              {!isCameraEnabled ? (
                <Button
                  type="button"
                  label="Start"
                  onClick={initializeCamera}
                  variant="secondary"
                  className="download-button"
                  icon={<IconPlayerPlay size={16} className="text-gray-500" />}
                  iconPosition='left'
                  rounded='lg'
                  size='sm'
                  fullWidth={true}
                />
              ) : (
                <Button
                  type="button"
                  label="Stop"
                  onClick={stopCamera}
                  variant="secondary"
                  className="download-button"
                  icon={<IconCameraCancel size={16} className="text-gray-500" />}
                  iconPosition='left'
                  rounded='lg'
                  size='sm'
                  fullWidth={true}
                />
              )}
              <div>
                <Badge
                  label={isCameraEnabled ? "Active" : "Stopped"}
                  variant={isCameraEnabled ? "success" : "gray"} // depends on your Badge variants
                  size="xsmall"
                />
              </div>
            </div>
            <hr className="my-2 w-full border-t border-zinc-950/5 dark:border-white/5" />
            <HydroFarmMapPanel />
          </div>
        </div>

        <LocationStatusOverview
          status={currentLocationStatus}
          loading={loading}
        />

      </div>
    </div>
  );
};

export default CameraByLocation;
