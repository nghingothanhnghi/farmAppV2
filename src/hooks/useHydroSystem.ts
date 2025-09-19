// src/hooks/useHydroSystem.ts

import { useState, useEffect, useCallback } from 'react';
import { systemService } from '../services/hydroSystemService';
import { actuatorService } from '../services/hydroActuatorService';
import { hardwareDetectionService } from '../services/hardwareDetectionService';
import type {
  SystemAlert,
  ControlAction,
  SensorReading,
  SystemStatusPerDevice,
  SystemThresholds as Thresholds,
  HydroActuator
} from '../models/interfaces/HydroSystem';
import type {
  HardwareDetectionResponse,
  LocationStatusResponse,
  HardwareDetectionSummaryResponse,
  HardwareType,
  ConditionStatus,
  HardwareDetectionCreate,
  BulkHardwareDetectionCreate,
  LocationHardwareInventoryCreate,
  LocationHardwareInventoryUpdate,
} from '../models/interfaces/HardwareDetection';

const MAX_ACTIONS = 10;

const createControlAction = (
  label: string,
  success: boolean,
  message: string
): ControlAction => ({
  action: label,
  timestamp: new Date().toISOString(),
  success,
  message,
});

export const useHydroSystem = () => {
  const [deviceStatusList, setDeviceStatusList] = useState<SystemStatusPerDevice[]>([]);
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [controlActions, setControlActions] = useState<ControlAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hardware Detection States
  const [hardwareDetections, setHardwareDetections] = useState<HardwareDetectionResponse[]>([]);
  const [locationStatus, setLocationStatus] = useState<Record<string, LocationStatusResponse>>({});
  const [detectionSummaries, setDetectionSummaries] = useState<HardwareDetectionSummaryResponse[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [hardwareTypes, setHardwareTypes] = useState<HardwareType[]>([]);
  const [conditionStatuses, setConditionStatuses] = useState<ConditionStatus[]>([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const appendAction = (action: ControlAction) =>
    setControlActions(prev => [action, ...prev.slice(0, MAX_ACTIONS - 1)]);

  const getDeviceThresholds = useCallback(
    (device_id: number) => deviceStatusList.find(d => d.device_id === device_id)?.automation?.thresholds || null,
    [deviceStatusList]
  );

  const fetchSensorData = useCallback(async () => {
    try {
      const data = await systemService.getLatestSensorData();
      setSensorData(data);
    } catch (err) {
      setError('Failed to fetch sensor data');
      console.error(err);
    }
  }, []);

  const fetchThresholds = useCallback(async () => {
    try {
      const data = await systemService.getThresholds();
      setThresholds(data);
    } catch (err) {
      setError('Failed to fetch thresholds');
      console.error(err);
    }
  }, []);

  // Hardware Detection Functions
  const fetchHardwareDetections = useCallback(async (location?: string, hardwareType?: HardwareType) => {
    try {
      const filters: any = {};
      if (location) filters.location = location;
      if (hardwareType) filters.hardware_type = hardwareType;

      const data = await hardwareDetectionService.getDetections(filters);
      setHardwareDetections(data);
    } catch (err) {
      setError('Failed to fetch hardware detections');
      console.error(err);
    }
  }, []);

  const fetchLocationStatus = useCallback(async (location: string) => {
    try {
      const data = await hardwareDetectionService.getLocationStatus(location);
      setLocationStatus(prev => ({ ...prev, [location]: data }));
    } catch (err) {
      setError(`Failed to fetch location status for ${location}`);
      console.error(err);
    }
  }, []);

  const fetchDetectionSummaries = useCallback(async (location?: string) => {
    try {
      const data = await hardwareDetectionService.getDetectionSummaries(location);
      setDetectionSummaries(data);
    } catch (err) {
      setError('Failed to fetch detection summaries');
      console.error(err);
    }
  }, []);

  const fetchAvailableLocations = useCallback(async () => {
    try {
      const data = await hardwareDetectionService.getDetectionLocations();
      setAvailableLocations(data);
    } catch (err) {
      setError('Failed to fetch available locations');
      console.error(err);
    }
  }, []);

  const fetchHardwareTypes = useCallback(async () => {
    try {
      const data = await hardwareDetectionService.getHardwareTypes();
      setHardwareTypes(data);
    } catch (err) {
      setError('Failed to fetch hardware types');
      console.error(err);
    }
  }, []);

  const fetchConditionStatuses = useCallback(async () => {
    try {
      const data = await hardwareDetectionService.getConditionStatuses();
      setConditionStatuses(data);
    } catch (err) {
      setError('Failed to fetch condition statuses');
      console.error(err);
    }
  }, []);

  const fetchActuatorsByDevice = useCallback(async (device_id: number): Promise<HydroActuator[]> => {
    try {
      return await actuatorService.getByDevice(device_id);
    } catch (err) {
      setError(`Failed to fetch actuators for device ${device_id}`);
      console.error(err);
      return [];
    }
  }, []);

  const updateActuator = async (id: number, updates: Partial<HydroActuator>) => {
    return actuatorService.update(id, updates);
  };

  const patchActuator = async (id: number, updates: Partial<HydroActuator>) => {
    return actuatorService.patch(id, updates);
  };


  const checkForAlerts = useCallback((statuses: SystemStatusPerDevice[]) => {
    const newAlerts: SystemAlert[] = [];

    statuses.forEach(({ sensors, device_id, device_name, automation }) => {
      const t = automation?.thresholds;
      if (!t) return;

      if (sensors.temperature > t.temperature_max) {
        newAlerts.push({
          id: `temp-${device_id}-${Date.now()}`,
          type: 'warning',
          message: `${device_name}: High temperature (${sensors.temperature}°C > ${t.temperature_max}°C)`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      if (sensors.moisture < t.moisture_min) {
        newAlerts.push({
          id: `moisture-${device_id}-${Date.now()}`,
          type: 'warning',
          message: `${device_name}: Low moisture (${sensors.moisture}% < ${t.moisture_min}%)`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      if (sensors.light < t.light_min) {
        newAlerts.push({
          id: `light-${device_id}-${Date.now()}`,
          type: 'info',
          message: `${device_name}: Low light (${sensors.light} lx < ${t.light_min} lx)`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      if (sensors.water_level < t.water_level_critical) {
        newAlerts.push({
          id: `water-critical-${device_id}-${Date.now()}`,
          type: 'error',
          message: `${device_name}: Critical water level (${sensors.water_level}% < ${t.water_level_critical}%)`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      } else if (sensors.water_level < t.water_level_min) {
        newAlerts.push({
          id: `water-low-${device_id}-${Date.now()}`,
          type: 'warning',
          message: `${device_name}: Low water level (${sensors.water_level}% < ${t.water_level_min}%)`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }
    });

    setAlerts(prev => [...prev.filter(a => !a.resolved), ...newAlerts]);
  }, []);

 const fetchSystemStatusPerDevice = useCallback(async () => {
  try {
    const data = await systemService.getSystemStatus();
    setDeviceStatusList(data);
    setError(null); // clear any previous error
    checkForAlerts(data);
  } catch (err: any) {
    // Detect Axios timeout / abort
    if (err.code === "ECONNABORTED" || err.message?.includes("aborted")) {
      console.warn("System status request timed out — skipping error display");
      return; // ✅ do not set error, just skip this cycle
    }

    const detail = err?.response?.data?.detail;

    if (detail === "No devices found for this user") {
      setDeviceStatusList([]);
      setError(null); // show empty state, not error
    } else {
      setError(detail || "Failed to fetch system status");
    }

    console.error("fetchSystemStatusPerDevice error:", err);
  }
}, [checkForAlerts]);


  const createControlHandler = (
    label: string,
    serviceFn: (device_id: number) => Promise<{ status: string }>
  ) => async (device_id: number) => {
    try {
      const result = await serviceFn(device_id);
      appendAction(createControlAction(label, true, result.status));
      await fetchSystemStatusPerDevice();
    } catch {
      appendAction(createControlAction(label, false, `Failed to ${label.toLowerCase()}`));
      setError(`Failed to ${label.toLowerCase()}`);
    }
  };

  const controlPump = createControlHandler('Pump ON', systemService.turnPumpOn);
  const controlPumpOff = createControlHandler('Pump OFF', systemService.turnPumpOff);
  const controlLight = createControlHandler('Light ON', systemService.turnLightOn);
  const controlLightOff = createControlHandler('Light OFF', systemService.turnLightOff);
  const startSystemScheduler = createControlHandler('Start Scheduler', systemService.startScheduler);
  const stopSystemScheduler = createControlHandler('Stop Scheduler', systemService.stopScheduler);
  const restartSystemScheduler = createControlHandler('Restart Scheduler', systemService.restartScheduler);

  const controlActuator = useCallback(async (actuatorId: number, turnOn: boolean) => {
    const label = `Actuator ${actuatorId} ${turnOn ? 'ON' : 'OFF'}`;
    try {
      const result = await systemService.controlActuator(actuatorId, turnOn);
      appendAction(createControlAction(label, true, result.status));
      await fetchSystemStatusPerDevice();
    } catch {
      appendAction(createControlAction(label, false, 'Failed to control actuator'));
      setError('Failed to control actuator');
    }
  }, [fetchSystemStatusPerDevice]);

  const updateSystemThresholds = useCallback(async (device_id: number, newThresholds: Partial<Thresholds>) => {
    try {
      const result = await systemService.updateThresholds(device_id, newThresholds);
      setThresholds(result.data);
      appendAction(createControlAction(`Update Thresholds (Device ${device_id})`, true, 'Thresholds updated'));
      await fetchSystemStatusPerDevice();
    } catch {
      setError('Failed to update thresholds');
    }
  }, [fetchSystemStatusPerDevice]);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  }, []);

  // Hardware Detection Actions
  const processDetectionResult = useCallback(async (
    detectionResultId: number,
    location: string,
    cameraSource?: string,
    confidenceThreshold: number = 0.5
  ) => {
    try {
      const result = await hardwareDetectionService.processDetectionResult(
        detectionResultId,
        location,
        cameraSource,
        confidenceThreshold
      );
      setHardwareDetections(prev => [...prev, ...result]);
      appendAction(createControlAction('Process Detection', true, `Processed ${result.length} detections`));

      // Refresh location status after processing
      await fetchLocationStatus(location);
    } catch (err) {
      appendAction(createControlAction('Process Detection', false, 'Failed to process detection'));
      setError('Failed to process detection result');
      console.error(err);
    }
  }, [fetchLocationStatus]);

  const validateDetection = useCallback(async (detectionId: number, isValid: boolean, notes?: string) => {
    try {
      const result = await hardwareDetectionService.validateDetection(detectionId, {
        is_validated: isValid,
        validation_notes: notes,
      });

      setHardwareDetections(prev =>
        prev.map(d => d.id === detectionId ? result : d)
      );

      appendAction(createControlAction(
        'Validate Detection',
        true,
        `Detection ${isValid ? 'validated' : 'rejected'}`
      ));
    } catch (err) {
      appendAction(createControlAction('Validate Detection', false, 'Failed to validate detection'));
      setError('Failed to validate detection');
      console.error(err);
    }
  }, []);

  const syncLocationInventory = useCallback(async (location: string) => {
    try {
      const result = await hardwareDetectionService.syncLocationInventory(location);
      appendAction(createControlAction('Sync Inventory', true, `Synced ${result.length} items`));

      // Refresh location status after sync
      await fetchLocationStatus(location);
    } catch (err) {
      appendAction(createControlAction('Sync Inventory', false, 'Failed to sync inventory'));
      setError('Failed to sync location inventory');
      console.error(err);
    }
  }, [fetchLocationStatus]);

  const setupLocationInventory = useCallback(async (location: string) => {
    try {
      await hardwareDetectionService.setupLocationInventory(location);
      appendAction(createControlAction('Setup Inventory', true, 'Location inventory setup completed'));

      // Refresh location status after setup
      await fetchLocationStatus(location);
    } catch (err) {
      appendAction(createControlAction('Setup Inventory', false, 'Failed to setup inventory'));
      setError('Failed to setup location inventory');
      console.error(err);
    }
  }, [fetchLocationStatus]);

  // WebSocket Connection Management
  const connectHardwareWebSocket = useCallback((locations: string[] = [], userId?: number) => {
    try {
      // Prevent duplicate connections
      if (isWebSocketConnected) {
        console.log('WebSocket already connected, skipping duplicate connection attempt');
        return;
      }

      hardwareDetectionService.connectWebSocket({
        locations,
        userId,
        onMessage: (message) => {
          console.log('Hardware detection WebSocket message:', message);

          // Handle different message types
          switch (message.type) {
            case 'detection_update':
              setHardwareDetections(prev => {
                const updated = prev.map(d =>
                  d.id === message.data.id ? { ...d, ...message.data } : d
                );
                return updated.some(d => d.id === message.data.id)
                  ? updated
                  : [...updated, message.data];
              });
              break;

            case 'location_status_update':
              setLocationStatus(prev => ({
                ...prev,
                [message.data.location]: message.data
              }));
              break;

            case 'new_detection':
              setHardwareDetections(prev => [message.data, ...prev]);
              // Create alert for new detection
              setAlerts(prev => [...prev, {
                id: `detection-${message.data.id}-${Date.now()}`,
                type: 'info',
                message: `New ${message.data.hardware_type} detected at ${message.data.location}`,
                timestamp: new Date().toISOString(),
                resolved: false,
              }]);
              break;

            default:
              console.log('Unknown hardware detection message type:', message.type);
          }
        },
        onOpen: () => {
          setIsWebSocketConnected(true);
          console.log('Hardware detection WebSocket connected');
        },
        onError: (error) => {
          setError('Hardware detection WebSocket error');
          console.error('Hardware detection WebSocket error:', error);
        },
        onClose: () => {
          setIsWebSocketConnected(false);
          console.log('Hardware detection WebSocket disconnected');
        }
      });
    } catch (err) {
      setError('Failed to connect hardware detection WebSocket');
      console.error(err);
    }
  }, []);

  const disconnectHardwareWebSocket = useCallback(() => {
    hardwareDetectionService.disconnectWebSocket();
    setIsWebSocketConnected(false);
  }, []);


  // --- Extended Hardware Detection Actions ---
  const createHardwareDetection = useCallback(async (data: HardwareDetectionCreate) => {
    try {
      const result = await hardwareDetectionService.createDetection(data);
      setHardwareDetections(prev => [...prev, result]);
      appendAction(createControlAction('Create Detection', true, 'Detection created'));
      return result;
    } catch (err) {
      appendAction(createControlAction('Create Detection', false, 'Failed to create detection'));
      setError('Failed to create detection');
      console.error(err);
      return null;
    }
  }, []);

  const createBulkHardwareDetections = useCallback(async (data: BulkHardwareDetectionCreate) => {
    try {
      const results = await hardwareDetectionService.createBulkDetections(data);
      setHardwareDetections(prev => [...prev, ...results]);
      appendAction(createControlAction('Create Bulk Detections', true, `${results.length} detections created`));
      return results;
    } catch (err) {
      appendAction(createControlAction('Create Bulk Detections', false, 'Failed to create bulk detections'));
      setError('Failed to create bulk detections');
      console.error(err);
      return [];
    }
  }, []);

  const createLocationInventory = useCallback(async (data: LocationHardwareInventoryCreate) => {
    try {
      const result = await hardwareDetectionService.createLocationInventory(data);
      appendAction(createControlAction('Create Location Inventory', true, 'Location inventory created'));
      return result;
    } catch (err) {
      appendAction(createControlAction('Create Location Inventory', false, 'Failed to create location inventory'));
      setError('Failed to create location inventory');
      console.error(err);
      return null;
    }
  }, []);

  const updateLocationInventory = useCallback(async (id: number, data: LocationHardwareInventoryUpdate) => {
    try {
      const result = await hardwareDetectionService.updateLocationInventory(id, data);
      appendAction(createControlAction('Update Location Inventory', true, 'Location inventory updated'));
      return result;
    } catch (err) {
      appendAction(createControlAction('Update Location Inventory', false, 'Failed to update location inventory'));
      setError('Failed to update location inventory');
      console.error(err);
      return null;
    }
  }, []);

  const fetchHardwareStats = useCallback(async () => {
    try {
      return await hardwareDetectionService.getStats();
    } catch (err) {
      setError('Failed to fetch hardware stats');
      console.error(err);
      return null;
    }
  }, []);

  const fetchHardwareTypeMapping = useCallback(async () => {
    try {
      return await hardwareDetectionService.getHardwareTypeMapping();
    } catch (err) {
      setError('Failed to fetch hardware type mapping');
      console.error(err);
      return {};
    }
  }, []);

  const fetchHydroLocations = useCallback(async () => {
    try {
      return await hardwareDetectionService.getHydroLocations();
    } catch (err) {
      setError('Failed to fetch hydro locations');
      console.error(err);
      return [];
    }
  }, []);

  const fetchLocationHealthReport = useCallback(async (location: string) => {
    try {
      return await hardwareDetectionService.getLocationHealthReport(location);
    } catch (err) {
      setError(`Failed to fetch health report for location: ${location}`);
      console.error(err);
      return null;
    }
  }, []);

  const fetchCameraSourcesByLocation = useCallback(async (location: string) => {
    try {
      return await hardwareDetectionService.getCameraSourcesByLocation(location);
    } catch (err) {
      setError(`Failed to fetch camera sources for ${location}`);
      console.error(err);
      return [];
    }
  }, []);

  const validateLocationHardware = useCallback(async (location: string, hoursBack: number = 24) => {
    try {
      return await hardwareDetectionService.validateLocationHardware(location, hoursBack);
    } catch (err) {
      setError(`Failed to validate hardware for ${location}`);
      console.error(err);
      return null;
    }
  }, []);

  const fetchCameraPlacementSuggestions = useCallback(async () => {
    try {
      return await hardwareDetectionService.getCameraPlacementSuggestions();
    } catch (err) {
      setError('Failed to fetch camera placement suggestions');
      console.error(err);
      return [];
    }
  }, []);


  const refreshData = useCallback((includeHardwareDetection: boolean = false, location?: string) => {
    fetchSystemStatusPerDevice();
    fetchSensorData();
    fetchThresholds();

    if (includeHardwareDetection) {
      fetchHardwareDetections(location);
      fetchDetectionSummaries(location);
      if (location) {
        fetchLocationStatus(location);
      }
    }
  }, [fetchSystemStatusPerDevice, fetchSensorData, fetchThresholds, fetchHardwareDetections, fetchDetectionSummaries, fetchLocationStatus]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSystemStatusPerDevice(),
          fetchSensorData(),
          fetchThresholds(),
          fetchAvailableLocations(),
          fetchHardwareTypes(),
          fetchConditionStatuses()
        ]);
      } catch {
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchSystemStatusPerDevice, fetchSensorData, fetchThresholds, fetchAvailableLocations, fetchHardwareTypes, fetchConditionStatuses]);

  useEffect(() => {
  // ✅ Only poll if devices exist
  if (deviceStatusList.length === 0) return;

  const interval = setInterval(() => refreshData(false), 5000);
  return () => clearInterval(interval);
}, [deviceStatusList.length, refreshData]);


  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      disconnectHardwareWebSocket();
    };
  }, [disconnectHardwareWebSocket]);

  return {
    // Original hydro system data
    deviceStatusList,
    sensorData,
    thresholds,
    alerts,
    controlActions,
    loading,
    error,

    // Hardware detection data
    hardwareDetections,
    locationStatus,
    detectionSummaries,
    availableLocations,
    hardwareTypes,
    conditionStatuses,
    isWebSocketConnected,

    actions: {
      // Original hydro system actions
      controlPump,
      controlPumpOff,
      controlLight,
      controlLightOff,
      startSystemScheduler,
      stopSystemScheduler,
      restartSystemScheduler,
      controlActuator,
      updateSystemThresholds,
      resolveAlert,
      getDeviceThresholds,
      fetchActuatorsByDevice,
      refreshData,
      updateActuator,
      patchActuator,

      // Hardware detection actions
      fetchHardwareDetections,
      fetchLocationStatus,
      fetchDetectionSummaries,
      fetchAvailableLocations,
      fetchHardwareTypes,
      fetchConditionStatuses,
      processDetectionResult,
      validateDetection,
      syncLocationInventory,
      setupLocationInventory,
      connectHardwareWebSocket,
      disconnectHardwareWebSocket,
      createHardwareDetection,
      createBulkHardwareDetections,
      createLocationInventory,
      updateLocationInventory,
      fetchHardwareStats,
      fetchHardwareTypeMapping,
      fetchHydroLocations,
      fetchLocationHealthReport,
      fetchCameraSourcesByLocation,
      validateLocationHardware,
      fetchCameraPlacementSuggestions,
    },
  };
};
