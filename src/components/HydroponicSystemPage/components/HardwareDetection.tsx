// src/components/HardwareDetection/HardwareDetection.tsx
import React, { useEffect, useState } from 'react';
import { useHydroSystem } from '../../../hooks/useHydroSystem';
import { IconRefresh } from '@tabler/icons-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import HardwareAlert from './HardwareAlerts';
import LocationStatusOverview from './LocationStatusOverview';

interface HardwareDetectionProps {
  location: string;
}

const HardwareDetection: React.FC<HardwareDetectionProps> = ({ location }) => {
  const {
    hardwareDetections,
    locationStatus,
    isWebSocketConnected,
    detectionSummaries,   // ✅ now available
    availableLocations,   // ✅ now available
    hardwareTypes,        // ✅ now available
    conditionStatuses,    // ✅ now available
    loading,
    actions
  } = useHydroSystem();

  const [selectedDetectionId, setSelectedDetectionId] = useState<number | null>(null);

  // Initialize hardware detection for the location
  useEffect(() => {
    if (location) {
      // Connect WebSocket for real-time updates
      actions.connectHardwareWebSocket([location]);

      // Fetch initial data
      actions.fetchHardwareDetections(location);
      actions.fetchLocationStatus(location);
      actions.fetchDetectionSummaries(location);

      // Fetch additional metadata
      actions.fetchAvailableLocations();
      actions.fetchHardwareTypes();
      actions.fetchConditionStatuses();
    }

    return () => {
      // Always disconnect to avoid duplicate connections when location changes or on unmount
      actions.disconnectHardwareWebSocket();
    };
  }, [location]);

  // Handle processing a detection result (simulated)
  const handleProcessDetection = async (detectionResultId: number) => {
    try {
      await actions.processDetectionResult(
        detectionResultId,
        location,
        'camera_1', // camera source
        0.7 // confidence threshold
      );
      console.log('Detection processed successfully');
    } catch (error) {
      console.error('Failed to process detection:', error);
    }
  };

  // Handle validating a detection
  const handleValidateDetection = async (detectionId: number, isValid: boolean) => {
    try {
      await actions.validateDetection(
        detectionId,
        isValid,
        isValid ? 'Validated by user' : 'Rejected by user'
      );
      console.log(`Detection ${isValid ? 'validated' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Failed to validate detection:', error);
    }
  };

  // Handle syncing location inventory
  const handleSyncInventory = async () => {
    try {
      await actions.syncLocationInventory(location);
      console.log('Inventory synced successfully');
    } catch (error) {
      console.error('Failed to sync inventory:', error);
    }
  };

  const currentLocationStatus = locationStatus[location];
  const locationDetections = hardwareDetections.filter(d => d.location === location);

  {/* Debug log for condition statuses */ }
  { console.log("ConditionStatuses Debug:", conditionStatuses) }

  // Debug information
  console.log('HardwareDetection Debug:', {
    location,
    hardwareDetections: hardwareDetections.length,
    locationDetections: locationDetections.length,
    currentLocationStatus,
    detectionSummaries: detectionSummaries.length,
    availableLocations: availableLocations.length,
    hardwareTypes: hardwareTypes.length,
    conditionStatuses: conditionStatuses.length,
    isWebSocketConnected,
    loading
  });

  return (
    <div className="space-y-10 mx-auto max-w-4xl">
      <div className='lg:flex lg:justify-between space-y-4 mt-10 mb-6'>
        <div className='flex lg:flex-col space-y-0.5'>
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">{location}</h3>
          {/* Connection Status */}
          <Badge
            variant={isWebSocketConnected ? 'success' : 'danger'}
            size="xsmall"
          >
            {isWebSocketConnected ? '🟢 WebSocket Connected' : '🔴 WebSocket Disconnected'}
          </Badge>
        </div>
        <div className='lg:flex-1 lg:flex lg:items-center lg:justify-end space-x-2'>
          {/* Action Buttons */}
          <div className="flex space-x-2 mb-6">
            <Button
              label="Refresh Data"
              onClick={() => {
                actions.fetchHardwareDetections(location);
                actions.fetchLocationStatus(location);
              }}
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
              size='sm'
            />

            <Button
              label="Sync Inventory"
              onClick={handleSyncInventory}
              disabled={loading}
              variant="secondary"
              rounded='lg'
              size='sm'
            />

            <Button
              label="Setup Inventory"
              onClick={() => actions.setupLocationInventory(location)}
              disabled={loading}
              variant="secondary"
              rounded='lg'
              size='sm'
            />

            <Button
              label="Process Sample Detection"
              onClick={() => handleProcessDetection(1)} // Sample detection result ID
              disabled={loading}
              variant="primary"
              rounded='lg'
              size='sm'
            />
          </div>
        </div>
      </div>

      {/* Location Status Overview */}
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Location Status Overview</h3>
        <LocationStatusOverview status={currentLocationStatus} loading={loading} columns={4} />
      </div>


      {/* Hardware Detections List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Recent Detections</h3>
          <span className="text-sm text-gray-500">
            {locationDetections.length} detection{locationDetections.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {locationDetections.length > 0 ? (
          <div className="space-y-3">
            {locationDetections.map((detection) => (
              <div
                key={detection.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedDetectionId === detection.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => setSelectedDetectionId(
                  selectedDetectionId === detection.id ? null : detection.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Status Indicator */}
                    <div className={`w-3 h-3 rounded-full ${detection.is_validated
                      ? 'bg-green-500'
                      : detection.is_expected
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                      }`}></div>

                    <div>
                      <h4 className="font-medium">
                        {detection.hardware_name || detection.detected_class}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Type: {detection.hardware_type} |
                        Confidence: {(detection.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {!detection.is_validated && (
                      <>
                        <Button
                          label="✓ Validate"
                          onClick={() => {
                            handleValidateDetection(detection.id, true);
                          }}
                          className="text-green-600 hover:bg-green-50"
                          variant="secondary"
                          size="sm"
                        />
                        <Button
                          label="✗ Reject"
                          onClick={() => {
                            handleValidateDetection(detection.id, false);
                          }}
                          className="text-red-600 hover:bg-red-50"
                          variant="secondary"
                          size="sm"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedDetectionId === detection.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Detection ID:</strong> {detection.id}</p>
                        <p><strong>Expected:</strong> {detection.is_expected ? 'Yes' : 'No'}</p>
                        <p><strong>Validated:</strong> {detection.is_validated ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p><strong>Camera Source:</strong> {detection.camera_source || 'N/A'}</p>
                        <p><strong>Detected At:</strong> {new Date(detection.detected_at).toLocaleString()}</p>
                        <p><strong>Condition:</strong> {detection.condition_status || 'Unknown'}</p>
                      </div>
                    </div>

                    {detection.condition_notes && (
                      <div className="mt-2">
                        <p className="text-sm"><strong>Notes:</strong> {detection.condition_notes}</p>
                      </div>
                    )}

                    {detection.validation_notes && (
                      <div className="mt-2">
                        <p className="text-sm"><strong>Validation Notes:</strong> {detection.validation_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Hardware Detections Found</h4>
            <p className="text-gray-500 mb-4">
              No hardware detections found for location: <strong>{location}</strong>
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Make sure the camera detection system is running</p>
              <p>• Verify the location parameter is correct</p>
              <p>• Try clicking "Process Sample Detection" to test</p>
              <p>• Check WebSocket connection status above</p>
            </div>
            <div className="mt-4">
              <Button
                label="Refresh Detections"
                onClick={() => actions.fetchHardwareDetections(location)}
                variant="secondary"
                size="sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Missing/Unexpected Hardware Alerts */}
      {currentLocationStatus && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HardwareAlert title="Missing Hardware" items={currentLocationStatus.missing_hardware} color="red" />
          <HardwareAlert title="Unexpected Hardware" items={currentLocationStatus.unexpected_hardware} color="yellow" />
        </div>
      )}

      {/* Detection Results Summary */}
      <div className="bg-white dark:bg-gray-900 dark:border-gray-700 rounded-lg shadow mb-6">
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Detection Results</h3>

        {detectionSummaries.length > 0 ? (
          <div className="space-y-4">
            {detectionSummaries.map((summary, index) => (
              <div key={summary.id || index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <p className="text-sm text-gray-600">{summary.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Total Detections</h4>
                    <p className="text-sm text-gray-600">{summary.total_detections}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Validated</h4>
                    <p className="text-sm text-gray-600">{summary.validated_detections}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Hardware Types</h4>
                    <p className="text-sm text-gray-600">{summary.unique_hardware_types}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Expected Present</h4>
                    <p className="text-sm text-gray-600">{summary.expected_present}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Expected Missing</h4>
                    <p className="text-sm text-gray-600">{summary.expected_missing}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Unexpected Present</h4>
                    <p className="text-sm text-gray-600">{summary.unexpected_present}</p>
                  </div>
                </div>
                {summary.detection_confidence_avg && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900">Average Confidence</h4>
                    <p className="text-sm text-gray-600">{(summary.detection_confidence_avg * 100).toFixed(1)}%</p>
                  </div>
                )}
                {summary.hardware_types_detected && summary.hardware_types_detected.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900">Detected Hardware Types</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {summary.hardware_types_detected.map((type) => (
                        <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 dark:bg-gray-900 dark:border-gray-700 p-4 rounded-lg">
            <p className="text-gray-600">No detection summaries available.</p>
          </div>
        )}
      </div>

      {/* Hardware Detection Tools */}
      <div className="bg-white dark:bg-gray-900 dark:border-gray-700 rounded-lg shadow">
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Hardware Detection Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Available Locations */}
          <div>
            <h3 className="font-medium mb-2">Available Locations</h3>
            {availableLocations.length > 0 ? (
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                onChange={e => actions.fetchHardwareDetections(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Select a location</option>
                {availableLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">No locations available</p>
            )}
          </div>

          {/* Hardware Types */}
          <div>
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Supported Hardware Types</h3>
            {hardwareTypes.length > 0 ? (
              <div className="max-h-32 overflow-y-auto">
                <ul className="text-sm space-y-1">
                  {hardwareTypes.map(type => (
                    <li key={type} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hardware types loaded</p>
            )}
          </div>

          {/* Condition Statuses */}
          <div>
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Condition Statuses</h3>
            {conditionStatuses.length > 0 ? (
              <div className="max-h-32 overflow-y-auto">
                <ul className="text-sm space-y-1">
                  {conditionStatuses.map(status => (
                    <li key={status} className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${status === "good"
                          ? "bg-green-500"
                          : status === "damaged"
                            ? "bg-red-500"
                            : status === "missing"
                              ? "bg-yellow-500"
                              : status === "unknown"
                                ? "bg-gray-500"
                                : "bg-gray-400"
                          }`}
                      />

                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No condition statuses loaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareDetection;