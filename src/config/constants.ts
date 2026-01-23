// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const OBJECT_DETECTION_STREAM_MODE = (import.meta.env.VITE_OBJECT_DETECTION_STREAM_MODE || 'http') as 'http' | 'websocket';
export const OBJECT_DETECTION_CAPTURE_INTERVAL = Number(import.meta.env.VITE_OBJECT_DETECTION_CAPTURE_INTERVAL || 1000);
export const OBJECT_DETECTION_MODEL_NAME = import.meta.env.VITE_OBJECT_DETECTION_MODEL_NAME || 'hardware-detection-model';

// App Configuration
export const APP_NAME = 'Device Controller';
export const APP_VERSION = '1.0.0';

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
};

export const STUCK_TIMEOUT = 20000; // 20s

// Default Values
export const DEFAULT_TAP_COORDINATES = {
  x: 500,
  y: 500,
};

export const LANDING_SECTIONS = [
  { id: 'hero', key: 'menu.home' },
  { id: 'about', key: 'menu.about' },
  { id: 'features', key: 'menu.features' },
  { id: 'setup', key: 'menu.setup' },
  { id: 'store', key: 'menu.store' },
];

