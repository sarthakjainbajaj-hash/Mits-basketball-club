import axios from 'axios';

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

// In-Memory Fast Cache for read-only GET requests (Instant 0ms page navigation)
const apiCache = new Map();
const CACHE_TTL_MS = 25 * 1000; // 25 seconds cache

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

// Request interceptor to attach JWT token and check memory cache
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hoopscore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || 'get').toLowerCase();

    // Cache check for GET requests
    if (method === 'get' && !config.params?._nocache && config.headers?.['Cache-Control'] !== 'no-cache') {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      const cached = apiCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        // Return synthetic response from cache to skip HTTP roundtrip
        config.adapter = () =>
          Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {},
          });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for caching and centralized error extraction
axiosClient.interceptors.response.use(
  (response) => {
    const config = response.config || {};
    const method = (config.method || 'get').toLowerCase();

    // Save successful GET responses into in-memory cache
    if (method === 'get' && response.data?.success && !config.params?._nocache) {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      apiCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    // Auto-invalidate cache on data modifications (POST, PUT, DELETE, PATCH)
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
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('hoopscore_token');
      localStorage.removeItem('hoopscore_user');
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
