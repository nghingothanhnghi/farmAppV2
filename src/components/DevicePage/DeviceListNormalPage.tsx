import React, { useState, useEffect } from 'react';
import { useDevices } from '../../hooks/useDevices';
import { useAlert } from '../../contexts/alertContext';
import Button from '../common/Button';
import { formatCoordinates } from '../../utils/formatters';
import { DEFAULT_TAP_COORDINATES } from '../../config/constants';
import DeviceScreenGrid from './components/DeviceScreenGrid';
import DeviceConnectionGuide from './components/DeviceConnectionGuide';
import PageTitle from '../common/PageTitle';
import DeviceConnectedList from './components/DeviceConnectedList';
import { IconRefresh, IconUserScreen, IconScreenShareOff } from '@tabler/icons-react';
import LinearProgress from '../common/LinearProgress';

const DeviceListNormalPage: React.FC = () => {
  const { setAlert } = useAlert();
  const { devices, loading, error, fetchDevices, tapAllDevices } = useDevices();
  const [x, setX] = useState<number>(DEFAULT_TAP_COORDINATES.x);
  const [y, setY] = useState<number>(DEFAULT_TAP_COORDINATES.y);
  const [showScreens, setShowScreens] = useState<boolean>(false);

  const handleTap = async () => {
    const result = await tapAllDevices(x, y);
    if (result) {
      setAlert({
        message: `Tapped at ${formatCoordinates(result.x, result.y)} on ${result.devices.length} devices`,
        type: 'success',
      });
    }
  };

  useEffect(() => {
    if (error) {
      setAlert({ message: error, type: 'error' });
    }
  }, [error, setAlert]);

  const toggleScreenView = () => {
    setShowScreens(!showScreens);
  };

  return (
    <React.Fragment>
      <PageTitle
        title="Connected Devices"
        actions={
          <>
            <div className='text-sm text-gray-500 mr-4'>
              Connected Devices <b className='text-green-500'>({devices.length})</b>
            </div>
            <Button
              label={showScreens ? "Hide Screens" : "Show Screens"}
              onClick={toggleScreenView}
              variant="secondary"
              disabled={loading || devices.length === 0}
              icon={showScreens ? <IconScreenShareOff size={20} /> : <IconUserScreen size={20} />}
              rounded='lg'
            />
            <Button
              label="Refresh"
              onClick={fetchDevices}
              variant="secondary"
              disabled={loading}
              icon={
                <IconRefresh
                  size={20}
                  className={loading ? 'animate-spin transition-transform' : ''}
                />
              }
              iconOnly
              rounded='full'
            />
          </>
        }
      />
      {loading ? (
        <LinearProgress
          position="absolute" // or 'fixed' if you want it on top of screen
          thickness="h-1"
          duration={3000} // adjust as needed
          message="Loading devices..."
        />
      ) : (
        <>
          {devices.length === 0 ? (
            <div className="mb-8">
              <DeviceConnectionGuide />
            </div>
          ) : (
            <>
              {/* Device List */}
              <div className="mb-8">
              <DeviceConnectedList devices={devices} layout='vertical' />
              </div>
              {/* Device Screens */}
              {showScreens && (
                <div className="mb-8">
                  <DeviceScreenGrid devices={devices} loading={loading} />
                </div>
              )}
            </>
          )}

          {/* Tap Controls */}
          <div className="mt-8 bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-700 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Send Tap Command</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">X Coordinate</label>
                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Y Coordinate</label>
                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <Button
              label="Tap All Devices"
              onClick={handleTap}
              disabled={loading || devices.length === 0}
              fullWidth
              rounded='lg'
            />
          </div>
        </>
      )}
    </React.Fragment>
  );
};

export default DeviceListNormalPage;