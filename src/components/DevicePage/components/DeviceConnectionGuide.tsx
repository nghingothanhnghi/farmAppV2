import React, { useState, useEffect } from 'react';
import { deviceAdbService } from '../../../services/deviceAdbService';
import Button from '../../common/Button';
import Spinner from '../../common/Spinner';

interface AdbStatus {
  status: string;
  adb_installed: boolean;
  adb_version: string;
  adb_server_running: boolean;
  adb_server_output: string;
  adb_client_connected: boolean;
  adb_client_message: string;
  devices: string[];
}

const DeviceConnectionGuide: React.FC = () => {
  const [adbStatus, setAdbStatus] = useState<AdbStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdbStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await deviceAdbService.getAdbStatus();
      setAdbStatus(status);
    } catch (err) {
      setError('Failed to fetch ADB status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestartAdb = async () => {
    setLoading(true);
    setError(null);
    try {
      await deviceAdbService.restartAdb();
      await fetchAdbStatus();
    } catch (err) {
      setError('Failed to restart ADB server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdbStatus();
  }, []);

  return (
    <div className="bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-700 shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Device Connection Guide</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <Spinner size={32} />
      ) : (
        <>
          {adbStatus && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">ADB Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ADB Installed:</span>
                    <span className={adbStatus.adb_installed ? "text-green-600" : "text-red-600"}>
                      {adbStatus.adb_installed ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ADB Version:</span>
                    <span>{adbStatus.adb_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ADB Server Running:</span>
                    <span className={adbStatus.adb_server_running ? "text-green-600" : "text-red-600"}>
                      {adbStatus.adb_server_running ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ADB Client Connected:</span>
                    <span className={adbStatus.adb_client_connected ? "text-green-600" : "text-red-600"}>
                      {adbStatus.adb_client_connected ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Devices Connected:</span>
                    <span>{adbStatus.devices.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="flex space-x-2">
                  <Button
                    label="Restart ADB Server"
                    onClick={handleRestartAdb}
                    variant="secondary"
                    disabled={loading}
                    rounded='lg'
                  />
                  <Button
                    label="Refresh Status"
                    onClick={fetchAdbStatus}
                    variant="primary"
                    disabled={loading}
                    rounded='lg'
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">Connection Instructions</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Connect your Android device to your computer using a USB cable</li>
                  <li>Enable USB debugging on your device:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Go to Settings &gt; About phone</li>
                      <li>Tap "Build number" 7 times to enable Developer options</li>
                      <li>Go back to Settings &gt; System &gt; Developer options</li>
                      <li>Enable "USB debugging"</li>
                    </ul>
                  </li>
                  <li>When prompted on your device, allow USB debugging</li>
                  <li>Click "Refresh Status" to check if your device is detected</li>
                  <li>If your device is not detected, try:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Disconnecting and reconnecting the USB cable</li>
                      <li>Using a different USB port</li>
                      <li>Clicking "Restart ADB Server"</li>
                      <li>Installing the appropriate USB drivers for your device</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeviceConnectionGuide;