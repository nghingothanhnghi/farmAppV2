import React, { useEffect, useState } from 'react';
import { useDevices } from '../../hooks/useDevices';
import { useAlert } from '../../contexts/alertContext';
import { IconClick, IconSwipeRight } from '@tabler/icons-react';
import DeviceScreenGrid from './components/DeviceScreenGrid';
import Button from '../common/Button';
import PageTitle from '../common/PageTitle';
import { IconRefresh } from '@tabler/icons-react';
import LinearProgress from '../common/LinearProgress';
import Announcement from '../Announcement/Announcement';
import List from '../common/List';
import DeviceConnectedList from './components/DeviceConnectedList';

interface DeviceListDemoPageProps {
  isDemoMode: boolean;
  toggleMode: () => void;
}

const trainingTips = [
  {
    id: 1,
    content: <><b>Tap:</b> Click once on the screen to tap at that location</>,
    icon: <IconClick className="text-green-500" size={16} />,
  },
  {
    id: 2,
    content: <><b>Swipe:</b> Click and drag to swipe from one point to another</>,
    icon: <IconSwipeRight className="text-green-500" size={16} />,
  },
];

const DeviceListDemoPage: React.FC<DeviceListDemoPageProps> = ({ isDemoMode, toggleMode }) => {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const { setAlert } = useAlert();
  const { devices, loading, error, fetchDevices } = useDevices();

  // Fetch devices on mount
  useEffect(() => {
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  useEffect(() => {
    if (error) {
      setAlert({ message: error, type: 'error' });
    }
  }, [error, setAlert]);

  const handleRefresh = async () => {
    try {
      await fetchDevices();
      setAlert({ message: 'Devices refreshed successfully!', type: 'success' });
    } catch (err) {
      setAlert({ message: 'Failed to refresh devices', type: 'error' });
    }
  };

  return (

    <React.Fragment>
      <PageTitle
        title="Android Device Streaming Demo"
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
              label="Refresh Devices"
              onClick={handleRefresh}
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
        <LinearProgress position="absolute" thickness="h-1" duration={3000} />
      ) : (
        <>
          {devices.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No devices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No Android devices are currently connected or the mock device service is not running.
              </p>
              <div className="mt-6">
                <Button
                  label="Try Again"
                  onClick={fetchDevices}
                  variant="primary"
                  rounded='lg'
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {showAnnouncement && (
                <Announcement
                  type="info"
                  title="Gesture Guide"
                  message={
                    <div className="training-info flex flex-col gap-4 text-gray-900 dark:text-gray-200 lg:pr-64">
                      <p>
                        This is a demo of the Android device streaming feature using simulated devices.
                        You can view the screen of each device in real-time and interact with them.
                      </p>
                      <h3 className="font-medium text-purple-700">💡 Guides</h3>
                      <List items={trainingTips} showIcons listStyle="none" className="text-gray-800 dark:text-gray-300" />
                    </div>
                  }
                  dismissible
                  onDismiss={() => setShowAnnouncement(false)}
                  className='mb-8'
                />
              )}


              {devices.length > 0 && (
                <div className='flex flex-col lg:flex-row gap-6'>
                  <div className='flex-1'>
                    <DeviceScreenGrid devices={devices} loading={loading} />
                  </div>
                  <div className='lg:w-[350px] space-y-2 flex flex-col max-h-full'>
                    <DeviceConnectedList devices={devices} layout='vertical' />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default DeviceListDemoPage;