import apiClient from "../api/client";
import { API_BASE_URL } from '../config/constants';
import type {
  HardwareDetectionCreate,
  HardwareDetectionResponse,
  BulkHardwareDetectionCreate,
  HardwareDetectionFilter,
  HardwareValidationRequest,
  LocationHardwareInventoryCreate,
  LocationHardwareInventoryUpdate,
  LocationHardwareInventoryResponse,
  HardwareDetectionStats,
  LocationStatusResponse,
  HardwareDetectionSummaryResponse,
  HardwareType,
  ConditionStatus,
} from "../models/interfaces/HardwareDetection";

let hardwareSocket: WebSocket | null = null;

// Close a socket without triggering the browser's "connection was interrupted
// while the page was loading" error when it is still CONNECTING (e.g. React
// StrictMode unmounting right after mount): defer the close until it opens.
function closeSocketQuietly(socket: WebSocket) {
  socket.onmessage = null;
  socket.onerror = null;
  socket.onclose = null;
  if (socket.readyState === WebSocket.CONNECTING) {
    socket.onopen = () => socket.close();
  } else {
    socket.onopen = null;
    if (socket.readyState === WebSocket.OPEN) socket.close();
  }
}

export const hardwareDetectionService = {
  async createDetection(data: HardwareDetectionCreate) {
    const res = await apiClient.post<HardwareDetectionResponse>("/hardware-detection", data);
    return res.data;
  },

  async createBulkDetections(data: BulkHardwareDetectionCreate) {
    const res = await apiClient.post<HardwareDetectionResponse[]>("/hardware-detection/bulk", data);
    return res.data;
  },

  async processDetectionResult(
    detectionResultId: number,
    location: string,
    cameraSource?: string,
    confidenceThreshold: number = 0.5
  ) {
    const res = await apiClient.post<HardwareDetectionResponse[]>(
      `/hardware-detection/process-detection/${detectionResultId}`,
      null,
      {
        params: {
          location,
          camera_source: cameraSource,
          confidence_threshold: confidenceThreshold,
        },
      }
    );
    return res.data;
  },

  async getDetections(filters: Partial<HardwareDetectionFilter>) {
    const res = await apiClient.get<HardwareDetectionResponse[]>("/hardware-detection", {
      params: filters,
    });
    return res.data;
  },

  async validateDetection(detectionId: number, data: HardwareValidationRequest) {
    const res = await apiClient.put<HardwareDetectionResponse>(
      `/hardware-detection/${detectionId}/validate`,
      data
    );
    return res.data;
  },

  async getLocationStatus(location: string) {
    const res = await apiClient.get<LocationStatusResponse>(
      `/hardware-detection/location/${location}/status`
    );
    return res.data;
  },

  async createLocationInventory(data: LocationHardwareInventoryCreate) {
    const res = await apiClient.post<LocationHardwareInventoryResponse>(
      "/hardware-detection/inventory",
      data
    );
    return res.data;
  },

  async updateLocationInventory(id: number, data: LocationHardwareInventoryUpdate) {
    const res = await apiClient.put<LocationHardwareInventoryResponse>(
      `/hardware-detection/inventory/${id}`,
      data
    );
    return res.data;
  },

  async syncLocationInventory(location: string) {
    const res = await apiClient.post<LocationHardwareInventoryResponse[]>(
      `/hardware-detection/inventory/sync/${location}`
    );
    return res.data;
  },

  async getStats() {
    const res = await apiClient.get<HardwareDetectionStats>("/hardware-detection/stats");
    return res.data;
  },

  async getHardwareTypes() {
    const res = await apiClient.get<HardwareType[]>("/hardware-detection/hardware-types");
    return res.data;
  },

  async getConditionStatuses() {
    const res = await apiClient.get<ConditionStatus[]>("/hardware-detection/condition-statuses");
    return res.data;
  },

  async getDetectionLocations() {
    const res = await apiClient.get<string[]>("/hardware-detection/locations");
    return res.data;
  },

  async getHardwareTypeMapping() {
    const res = await apiClient.get<Record<HardwareType, string>>("/hardware-detection/hardware-mapping");
    return res.data;
  },

  async getHydroLocations() {
    const res = await apiClient.get<string[]>("/hardware-detection/hydro-integration/locations");
    return res.data;
  },

  async getLocationHealthReport(location: string) {
    const res = await apiClient.get<LocationStatusResponse>(
      `/hardware-detection/hydro-integration/location/${location}/health`
    );
    return res.data;
  },

  async getCameraSourcesByLocation(location: string): Promise<string[]> {
    const res = await apiClient.get<string[]>(
      `/hardware-detection/location/${location}/camera-sources`
    );
    return res.data;
  },

  async validateLocationHardware(location: string, hoursBack: number = 24) {
    const res = await apiClient.post(
      `/hardware-detection/hydro-integration/location/${location}/validate`,
      null,
      { params: { hours_back: hoursBack } }
    );
    return res.data;
  },

  async getCameraPlacementSuggestions(): Promise<string[]> {
    const res = await apiClient.get("/hardware-detection/hydro-integration/camera-placement-suggestions");
    return res.data;
  },



  async setupLocationInventory(location: string) {
    const res = await apiClient.post(`/hardware-detection/hydro-integration/location/${location}/setup-inventory`);
    return res.data;
  },

  async getDetectionSummaries(location?: string): Promise<HardwareDetectionSummaryResponse[]> {
    const res = await apiClient.get("/hardware-detection/summary", {
      params: location ? { location } : undefined,
    });
    return res.data;
  },

  connectWebSocket({
    locations = [],
    userId = null,
    onMessage,
    onOpen,
    onError,
    onClose,
  }: {
    locations?: string[];
    userId?: number | null;
    onMessage: (msg: any) => void;
    onOpen?: () => void;
    onError?: (event: Event) => void;
    onClose?: () => void;
  }) {
    // Close existing connection if any
    if (hardwareSocket) {
      console.log('[WebSocket] Closing existing connection before creating new one');
      closeSocketQuietly(hardwareSocket);
      hardwareSocket = null;
    }

    const baseUrl = API_BASE_URL ?? 'http://localhost:8000';
    let wsBaseUrl: string;
    if (baseUrl.startsWith('https')) {
      wsBaseUrl = baseUrl.replace('https', 'wss');
    } else {
      wsBaseUrl = baseUrl.replace('http', 'ws');
    }
    const params = new URLSearchParams();
    // Backend expects ONE comma-separated string: ?locations=A,B
    // (it declares `locations: Optional[str]`, so repeated keys would keep only the last one)
    if (locations.length > 0) params.set('locations', locations.join(','));

    if (userId !== null) params.append('user_id', String(userId));

    const wsUrl = `${wsBaseUrl}/ws/hardware-detection?${params.toString()}`;
    console.log('[WebSocket] Creating new connection to:', wsUrl);

    const socket = new WebSocket(wsUrl);
    hardwareSocket = socket;

    // Every handler checks `socket === hardwareSocket` so a stale socket
    // (closed by a newer connectWebSocket call or by React StrictMode's
    // mount/unmount/mount) can never fire callbacks or clear the new reference.
    socket.onopen = () => {
      if (socket !== hardwareSocket) return;
      console.log('[WebSocket] Hardware detection connected');
      onOpen?.();
    };

    socket.onmessage = (event) => {
      if (socket !== hardwareSocket) return;
      try {
        const msg = JSON.parse(event.data);
        console.log('[WebSocket] Received:', msg);
        onMessage(msg);
      } catch (err) {
        console.error('[WebSocket] Invalid message:', err);
      }
    };

    socket.onerror = (event) => {
      if (socket !== hardwareSocket) return;
      console.error('[WebSocket] Error:', event);
      onError?.(event);
    };

    socket.onclose = () => {
      if (socket !== hardwareSocket) return;
      console.warn('[WebSocket] Hardware detection socket closed');
      hardwareSocket = null;
      onClose?.();
    };

    return socket;
  },

  sendWebSocketMessage(message: any) {
    if (hardwareSocket?.readyState === WebSocket.OPEN) {
      hardwareSocket.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Not connected');
    }
  },

  disconnectWebSocket() {
    if (hardwareSocket) {
      closeSocketQuietly(hardwareSocket);
      hardwareSocket = null;
    }
  },


};