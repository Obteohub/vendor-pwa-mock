// src/lib/axiosClient.js
// Axios client with interceptors for JWT authentication

import axios from 'axios';

// Create axios instance
const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add JWT token to requests
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('sw_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[AXIOS] ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.error('[AXIOS] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
axiosClient.interceptors.response.use(
  (response) => {
    console.log(`[AXIOS] Response from ${response.config.url}:`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('[AXIOS] Response error:', {
      url: error.config?.url || 'unknown',
      status: error.response?.status || 'network error',
      message: error.message || 'no message',
      data: error.response?.data || 'no response body'
    });

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth data
      localStorage.removeItem('sw_token');
      localStorage.removeItem('sw_user');

      // Dispatch event for store to update
      window.dispatchEvent(new CustomEvent('auth-logout'));

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden - No permission
    if (error.response?.status === 403) {
      console.error('[AXIOS] Forbidden - User lacks permission');
    }

    // Handle network errors
    if (!error.response) {
      console.error('[AXIOS] Network error - No response received');
      error.isNetworkError = true;
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
