# Repository Overview

- Name: farmApp
- Purpose: Frontend UI for hydroponic system management, camera-based object detection, and hardware inventory validation.
- Framework: React + TypeScript (Vite)
- Styling: Tailwind CSS
- Key features:
  - Camera streaming and object detection via WebSocket/HTTP
  - Hardware detection lifecycle with backend integration (REST + WebSocket)
  - Hydro system device status, sensors, actuators, schedules

## Important Paths
- src/components/HydroponicSystemPage
  - HardwareDetection.tsx: UI using useHydroSystem for detection + inventory/status
  - CameraByLocation.tsx: Camera stream + overlay + backend sync throttling
  - StoredDetections.tsx, RealtimeDetections.tsx: UI overlays
- src/hooks
  - useHydroSystem.ts: Central state/actions for hydro system + hardware detection; manages REST + hardware WS
  - useCamera.ts: MediaDevices camera setup
  - useStreaming.ts: Object detection WS/HTTP pipeline
- src/services
  - hardwareDetectionService.ts: REST + hardware detection WebSocket
  - objectDetectionService.ts: Object detection REST + WS
- src/models/interfaces
  - Camera.ts: Detection/DetectionResult
  - HardwareDetection.ts: Types for hardware detection domain
- src/config/constants.ts: API_BASE_URL and flags

## Runtime Integrations
- API base URL: API_BASE_URL (VITE_API_BASE_URL env overrides; default http://localhost:8000)
- WebSockets:
  - Object detection WS: ws://<API_BASE_URL_HOST>/object-detection/ws
  - Hardware detection WS: ws://<API_BASE_URL_HOST>/ws/hardware-detection

## Data Flow Summary
- Camera → useCamera → useStreaming (WS/HTTP) → DetectionResult
- CameraByLocation:
  - Normalizes payload, draws boxes, sets currentDetections
  - When detection_id present: actions.processDetectionResult(location, source, threshold)
  - Throttled (10s) sync: syncLocationInventory + refresh status/detections
- useHydroSystem:
  - REST: fetchHardwareDetections, fetchLocationStatus, fetchDetectionSummaries, validateDetection, inventory CRUD, stats
  - WS: connect/disconnect hardware detection, onMessage updates detections + location status + alerts

## Conventions
- Bounding boxes normalized to [x1,y1,x2,y2]
- classToHardwareType maps detection class → HardwareType (utils/hardwareMappings)
- Recent stored detections should be sorted by detected_at desc for UI

## Known Considerations
- WS detection frames typically do not include detection_id; only HTTP detect-base64 responses do.
- Ensure correct model name in useStreaming (default 'hardware-detection-model'); can be configured.
- Avoid duplicate hardware WS connections; managed in useHydroSystem.

## Commands (typical)
- Dev: npm run dev
- Build: npm run build
- Preview: npm run preview