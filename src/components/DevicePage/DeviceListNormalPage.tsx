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
import NumberInput from '../common/NumberInput';

interface DeviceListNormalPageProps {
  isDemoMode: boolean;
  toggleMode: () => void;
}

const DeviceListNormalPage: React.FC<DeviceListNormalPageProps> = ({ isDemoMode, toggleMode }) => {
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
            <Button
              label={isDemoMode ? "Switch to Normal Mode" : "Switch to Demo Mode"}
              onClick={toggleMode}
              variant="secondary"
              rounded="lg"
              className='mr-4'
            />
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
            <div className='flex flex-col lg:flex-row gap-6'>
              <div className='flex-1'>
                <DeviceScreenGrid devices={devices} loading={loading} />
              </div>
              <div className='lg:w-[350px] space-y-2 flex flex-col max-h-full'>
                <DeviceConnectedList devices={devices} layout='vertical' />
                {/* Tap Controls */}
                <div className="bg-white border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800
            shadow dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 line-clamp-1">Send Tap Command</h3>
                  <div className="mt-5 grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[0.625rem] text-gray-500 mb-1">X Coordinate</label>
                      <NumberInput id="x-coordinate" value={x} onChange={setX} min={0} max={1920} step={5} />
                    </div>
                    <div>
                      <label className="block text-[0.625rem] text-gray-500 mb-1">Y Coordinate</label>
                      <NumberInput id="y-coordinate" value={y} onChange={setY} min={0} max={1080} step={5} />
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
              </div>
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default DeviceListNormalPage;