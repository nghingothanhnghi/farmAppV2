import axios from 'axios';
import { API_BASE_URL } from '../config/constants';


// Axios interceptors live outside React, so we use a small callback
// registry to let AuthContext hook into 401 responses.
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  onUnauthorized = handler;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response?.status === 401) {
      const url: string = error.config?.url || '';

      // Don't trigger the global "session expired" flow for the login
      // request itself — a 401 there just means wrong credentials.
      const isLoginRequest = url.includes('/auth/login');
      if (!isLoginRequest) {
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;