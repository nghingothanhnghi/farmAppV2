// src/components/HydroponicSystemPage/HydroponicSystemPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PageTitle from '../common/PageTitle';
import LinearProgress from '../common/LinearProgress';
import DropdownButton from '../common/DropdownButton';
import Tabs from "../common/Tabs";
import WaterLevelBucket from '../common/chartCustom/WaterLevelBucket';
import { IconPlus, IconArtboard } from '@tabler/icons-react';
import { useHydroSystem } from '../../hooks/useHydroSystem';
import type { SystemStatusPerDevice } from '../../models/interfaces/HydroSystem';

// Import dashboard components
import CameraByLocation from './components/CameraByLocation';
import LocationPanel from './components/LocationPanel';
import StatusCard from './components/StatusCard';
import MultiActuatorControlPanel from './components/MultiActuatorControlPanel';
import SchedulerControlPanel from './components/SchedulerControlPanel';
import HardwareDetection from './components/HardwareDetection';
import SensorChart from './components/SensorChart';
import AlertsPanel from './components/AlertsPanel';
import SettingsPanel from './components/SettingsPanel';
import ActivityLog from './components/ActivityLog';
import Button from '../common/Button';

import './HydroponicSystemPage.css';

const HydroponicSystemPage: React.FC = () => {
  const {
    deviceStatusList,
    sensorData,
    // thresholds,
    alerts,
    controlActions,
    loading,
    error,
    actions
  } = useHydroSystem();
  const navigate = useNavigate();
  // const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'settings' | 'hardware'>('overview');
  const [activeDeviceId, setActiveDeviceId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Automatically select first device on load
  useEffect(() => {
    if (!activeDeviceId && deviceStatusList.length > 0) {
      setActiveDeviceId(deviceStatusList[0].device_id);
    }
  }, [deviceStatusList, activeDeviceId]);

  // Find current device or fallback
  const currentDevice = useMemo<SystemStatusPerDevice | null>(() => {
    if (!deviceStatusList.length) return null;
    return (
      deviceStatusList.find((d) => d.device_id === activeDeviceId) ??
      deviceStatusList[0]
    );
  }, [deviceStatusList, activeDeviceId]);

  // Show loading state if still fetching and no devices yet
if (loading && deviceStatusList.length === 0) {
  return (
    <div className="hydroponic-system-page min-h-screen">
      <PageTitle title="Hydroponic System Dashboard" />
      <LinearProgress
        position="absolute"
        thickness="h-1"
        duration={3000}
      />
    </div>
  );
}

// ✅ Handle "No devices found" gracefully (instead of error)
if (error && error.includes("No devices found for this user")) {
  return (
    <div className="hydroponic-system-page min-h-screen">
      <PageTitle title="Hydroponic System Dashboard" />
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-400 text-4xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Devices Found</h3>
        <p className="text-gray-600 mb-4">
          You don’t have any devices connected yet.
          Please add a hydroponic device to get started.
        </p>
        <Button
          label="➕ Add Device"
          onClick={() => navigate('/hydro-devices')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
          rounded="lg"
        />
      </div>
    </div>
  );
}

// Generic connection/server error
if (error) {
  return (
    <div className="hydroponic-system-page min-h-screen">
      <PageTitle title="Hydroponic System Dashboard" />
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          label="Retry Connection"
          onClick={actions.refreshData}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2"
          rounded="lg"
        />
      </div>
    </div>
  );
}

// Fallback if no devices but no error (rare case)
if (!loading && deviceStatusList.length === 0) {
  return (
    <div className="hydroponic-system-page min-h-screen">
      <PageTitle title="Hydroponic System Dashboard" />
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-400 text-4xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Devices Found</h3>
        <p className="text-gray-600 mb-4">
          You don’t have any devices connected yet.
          Please add a hydroponic device to get started.
        </p>
        <Button
          label="➕ Add Device"
          onClick={() => navigate('/hydro-devices')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
          rounded="lg"
        />
      </div>
    </div>
  );
}

  const getSensorCount = (sensors: Record<string, any> | undefined): number => {
    if (!sensors) return 0;
    // ignore meta keys
    const ignoredKeys = ["device_id", "device_name"];
    return Object.keys(sensors).filter((key) => !ignoredKeys.includes(key)).length;
  };


  const getTemperatureStatus = () => {
    if (!currentDevice) return 'normal';
    const deviceThresholds = currentDevice.automation?.thresholds;
    const temp = currentDevice.sensors?.temperature;
    if (temp === undefined || !deviceThresholds) return 'normal';
    if (temp > deviceThresholds.temperature_max) return 'error';
    if (temp > deviceThresholds.temperature_max * 0.9) return 'warning';
    return 'normal';
  };

  const getMoistureStatus = () => {
    if (!currentDevice) return 'normal';
    const deviceThresholds = currentDevice.automation?.thresholds;
    const moisture = currentDevice.sensors?.moisture;
    if (moisture === undefined || !deviceThresholds) return 'normal';
    if (moisture < deviceThresholds.moisture_min) return 'error';
    if (moisture < deviceThresholds.moisture_min * 1.1) return 'warning';
    return 'normal';
  };

  const getLightStatus = () => {
    if (!currentDevice) return 'normal';
    const deviceThresholds = currentDevice.automation?.thresholds;
    const light = currentDevice.sensors?.light;
    if (light === undefined || !deviceThresholds) return 'normal';
    if (light < deviceThresholds.light_min) return 'error';
    if (light < deviceThresholds.light_min * 1.1) return 'warning';
    return 'normal';
  };

  const getWaterLevelStatus = () => {
    if (!currentDevice) return 'normal';
    const deviceThresholds = currentDevice.automation?.thresholds;
    const waterLevel = currentDevice.sensors?.water_level;
    if (waterLevel === undefined || !deviceThresholds) return 'normal';
    if (waterLevel < deviceThresholds.water_level_critical) return 'error';
    if (waterLevel < deviceThresholds.water_level_min) return 'warning';
    return 'normal';
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: "📊",
      content: (
        <div className="space-y-6">
          <div className='flex flex-col lg:flex-row gap-6'>
            <div className='flex-1'>
              <CameraByLocation location={currentDevice?.location} />
            </div>
            <div className='lg:w-[350px] space-y-2 flex flex-col max-h-full'>
              {/* Location Panel */}
              <LocationPanel
                title={currentDevice?.location || "Unknown Location"}
                description={
                  currentDevice
                    ? `Device: ${currentDevice.device_name || `ID ${currentDevice.device_id}`} · 
         Sensors: ${getSensorCount(currentDevice.sensors)} · 
         Actuators: ${currentDevice.actuators?.length || 0}`
                    : "No device data available."
                }
              />
              {/* Control Panel */}
              <MultiActuatorControlPanel
                systemStatus={currentDevice}
                onActuatorControl={(actuatorId, turnOn) => {
                  actions.controlActuator(actuatorId, turnOn);
                }}
                loading={loading}
              />
              <SchedulerControlPanel
                schedulerState={currentDevice?.system?.scheduler_state ?? false}
                onStart={() => { if (currentDevice?.device_id) actions.startSystemScheduler(currentDevice.device_id); }}
                onStop={() => { if (currentDevice?.device_id) actions.stopSystemScheduler(currentDevice.device_id); }}
                onRestart={() => { if (currentDevice?.device_id) actions.restartSystemScheduler(currentDevice.device_id); }}
                loading={loading}
                title="System Scheduler"
                summary="Start/stop/restart the automation scheduler for this device"
              />
            </div>
          </div>
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[1fr_1fr_1fr_350px] grid-rows-2 auto-rows-fr gap-6">
            <StatusCard
              className='row-span-2'
              title="Water Level"
              value={currentDevice?.sensors?.water_level?.toFixed(1) || '--'}
              unit="%"
              status={getWaterLevelStatus()}
              icon="🚰">
              <WaterLevelBucket level={currentDevice?.sensors?.water_level || 0} />
            </StatusCard>

            <StatusCard
              title="Temperature"
              value={currentDevice?.sensors?.temperature?.toFixed(1) || '--'}
              unit="°C"
              status={getTemperatureStatus()}
              icon="🌡️"
            />
            <StatusCard
              title="Humidity"
              value={currentDevice?.sensors?.humidity?.toFixed(1) || '--'}
              unit="%"
              status="normal"
              icon="💧"
            />
            {/* Activity Log, Right side, tall block */}
            <ActivityLog className='row-span-2' actions={controlActions} />
            <StatusCard
              title="Moisture"
              value={currentDevice?.sensors?.moisture?.toFixed(1) || '--'}
              unit="%"
              status={getMoistureStatus()}
              icon="🌱"
            />
            <StatusCard
              title="Light"
              value={currentDevice?.sensors?.light?.toFixed(0) || '--'}
              unit="lux"
              status={getLightStatus()}
              icon="☀️"
            />

          </div>
          {/* Alerts Panel */}
          <AlertsPanel
            alerts={alerts}
            onResolveAlert={actions.resolveAlert}
          />
        </div>
      ),
    },
    {
      id: "charts",
      label: "Charts",
      icon: "📈",
      content: (
        <div className="space-y-6">
          <SensorChart
            data={sensorData}
            type="water_level"
            title="Water Level"
            unit="cm"
            color="#6366f1" // Indigo
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SensorChart
              data={sensorData}
              type="temperature"
              title="Temperature"
              unit="°C"
              color="#ef4444"
            />
            <SensorChart
              data={sensorData}
              type="humidity"
              title="Humidity"
              unit="%"
              color="#3b82f6"
            />
            <SensorChart
              data={sensorData}
              type="moisture"
              title="Soil Moisture"
              unit="%"
              color="#10b981"
            />
            <SensorChart
              data={sensorData}
              type="light"
              title="Light Level"
              unit="lux"
              color="#f59e0b"
            />
          </div>
        </div>
      ),
    },
    {
      id: "hardware",
      label: "Hardware Detection",
      icon: "📷",
      content: currentDevice?.location && (
        <HardwareDetection location={currentDevice.location} />
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      content: (
        <SettingsPanel
          thresholds={currentDevice?.automation?.thresholds || null}
          onUpdateThresholds={(newThresholds) => {
            if (!currentDevice) return;
            actions.updateSystemThresholds(currentDevice.device_id, newThresholds);
          }}
          loading={loading}
        />
      ),
    },
  ];

  console.log("Device List:", deviceStatusList);
  console.log("Active Device ID:", activeDeviceId);
  console.log("Current Device:", currentDevice);
  console.log("Current Device Location:", currentDevice?.location);

  return (
    <div className="hydroponic-system-page min-h-screen">
      <PageTitle
        title="Hydroponic System Dashboard"
        subtitle="Monitor and control your hydroponic growing system"
        actions={
          <div className='flex space-x-0.5'>
            {/* Device Selector */}
            <DropdownButton
              label={
                <div className="flex items-center gap-2">
                  <IconArtboard size={18} />
                  <span>
                    {currentDevice
                      ? `Device: ${currentDevice.device_name || `ID ${currentDevice.device_id}`}`
                      : 'Select Device'}
                  </span>
                </div>
              }
              items={deviceStatusList
                .filter((device) => device?.device_id !== undefined)
                .map((device) => ({
                  label: device.device_name || `Device ID ${device.device_id}`,
                  value: device.device_id.toString(),
                }))}
              onSelect={(item) => setActiveDeviceId(Number(item.value))}
              className='bg-transparent'
            />
            <Button
              variant="secondary"
              icon={<IconPlus size={18} />}
              iconOnly
              rounded='full'
              label="Close"
              className='bg-transparent'
              onClick={() => navigate('/hydro-devices')}
            />
          </div>
        }
      />
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Refresh Button */}
      <div className="fixed bottom-50 lg:bottom-6 right-6">
        <Button
          variant='secondary'
          label={loading ? '⟳' : '🔄'}
          onClick={actions.refreshData}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default HydroponicSystemPage;