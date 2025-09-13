import React, { useState } from 'react';
import DeviceScreen from './DeviceScreen';
import LinearProgress from '../../common/LinearProgress';
import Button from '../../common/Button';

interface DeviceScreenGridProps {
  devices: string[];
  loading?: boolean;
}

const DeviceScreenGrid: React.FC<DeviceScreenGridProps> = ({ devices, loading = false }) => {
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

  // If a device is expanded, show only that device in full screen
  if (expandedDevice) {
    return (
      <div className="space-y-4">
        <Button
          label="Back to All Devices"
          onClick={() => setExpandedDevice(null)}
          variant="secondary"
          rounded='lg'
        />
        <DeviceScreen
          deviceSerial={expandedDevice}
          onClose={() => setExpandedDevice(null)}
        />
      </div>
    );
  }

  // Show loading indicator if loading
  if (loading) {
    return (
      <LinearProgress
        position="absolute" // or 'fixed' if you want it on top of screen
        thickness="h-1"
        duration={3000} // adjust as needed
        message="Loading device screens..."
      />
    );
  }


  // If no devices, show a message
  if (devices.length === 0) {
    return (
      <div className="bg-gray-100 p-6 rounded text-center">
        No devices connected. Connect a device and refresh.
      </div>
    );
  }

  return (
    <div className='h-full'>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((deviceSerial) => (
          <div
            key={deviceSerial}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => setExpandedDevice(deviceSerial)}
          >
            <DeviceScreen deviceSerial={deviceSerial} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceScreenGrid;