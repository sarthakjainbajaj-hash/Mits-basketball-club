import axios from 'axios';
import { initClientPerformanceMonitoring } from '../services/vitalsService';

// Resolve normalized API Base URL:
// 1. If VITE_API_URL is provided: ensure it points to the API root (ends with /api)
// 2. If not provided and running in production (Vercel/browser): default to Render backend URL + /api
// 3. If running locally: default to http://localhost:5000/api
const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;

  if (url && typeof url === 'string' && url.trim() !== '') {
    url = url.trim().replace(/\/+$/, ''); // remove trailing slashes
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    return url;
  }

  // Fallback when VITE_API_URL is not provided
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost) {
      return 'https://mits-basketball-club.onrender.com/api';
    }
  }

  return 'http://localhost:5000/api';
};

const API_URL = getApiBaseUrl();

// Initialize native Web Vitals tracking (LCP, INP, CLS, TTFB)
if (typeof window !== 'undefined') {
  initClientPerformanceMonitoring(API_URL);
}

// In-Memory Fast Cache for read-only GET requests (Instant 0ms page navigation)
const apiCache = new Map();
// In-Flight Promise Map for concurrent Request Deduplication (prevents duplicate parallel network calls)
const inFlightRequests = new Map();

// Recent client API latency logs for Admin Monitoring Dashboard
export const clientLatencyLogs = [];
const MAX_CLIENT_LOGS = 50;

// Dynamic Cache TTL based on route sensitivity
const getCacheTtl = (url = '') => {
  // Live matches & active scoreboards need real-time data
  if (url.includes('/matches/') && !url.includes('/history')) {
    return 2000; // 2 seconds TTL for match data
  }
  // Relatively static data: tournaments, teams, players
  return 25 * 1000; // 25 seconds
};

export const clearApiCache = () => {
  apiCache.clear();
};

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45s timeout to comfortably tolerate free-tier container wakeups
});

// Request interceptor to attach JWT token, measure latency start, and check memory cache
axiosClient.interceptors.request.use(
  (config) => {
    config._startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const token = localStorage.getItem('hoopscore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || 'get').toLowerCase();

    // Cache check for GET requests
    if (method === 'get' && !config.params?._nocache && config.headers?.['Cache-Control'] !== 'no-cache') {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      const cached = apiCache.get(cacheKey);
      const ttl = getCacheTtl(config.url);

      if (cached && Date.now() - cached.timestamp < ttl) {
        // Return synthetic response from memory cache (0ms network roundtrip)
        config.adapter = () =>
          Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: { 'x-hoopscore-cache': 'HIT' },
            config,
            request: {},
          });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for caching, latency recording, and centralized error extraction
axiosClient.interceptors.response.use(
  (response) => {
    const config = response.config || {};
    const method = (config.method || 'get').toLowerCase();

    // Measure roundtrip latency
    if (config._startTime && typeof performance !== 'undefined') {
      const latencyMs = Math.round((performance.now() - config._startTime) * 10) / 10;
      const isCached = response.headers?.['x-hoopscore-cache'] === 'HIT';

      if (clientLatencyLogs.length >= MAX_CLIENT_LOGS) {
        clientLatencyLogs.shift();
      }
      clientLatencyLogs.push({
        url: config.url,
        method: method.toUpperCase(),
        status: response.status,
        latencyMs,
        cached: isCached,
        timestamp: Date.now(),
      });
    }

    // Save successful GET responses into in-memory cache
    if (method === 'get' && response.data?.success && !config.params?._nocache) {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      apiCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    // Auto-invalidate cache on data mutations (POST, PUT, DELETE, PATCH)
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      clearApiCache();
    }

    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    // Auto logout on 401 if token was expired
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('hoopscore_token');
      localStorage.removeItem('hoopscore_user');
      window.dispatchEvent(new CustomEvent('hoopscore_unauthorized'));
    }

    return Promise.reject(new Error(message));
  }
);

// Background Warm-Up & Keep-Alive to prevent Render free-tier sleep
if (typeof window !== 'undefined') {
  const triggerWarmup = () => {
    const healthUrl = API_URL.replace(/\/api$/, '') + '/health';
    fetch(healthUrl, { mode: 'cors' }).catch(() => {});
  };

  // Immediate warmup ping on initial load
  setTimeout(triggerWarmup, 100);

  // Periodic keep-alive ping every 9 minutes while page is open
  setInterval(triggerWarmup, 9 * 60 * 1000);
}

export default axiosClient;
