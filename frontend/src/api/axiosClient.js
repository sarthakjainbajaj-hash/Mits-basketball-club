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

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hoopscore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error extraction
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    // Auto logout on 401 if token was expired
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('hoopscore_token');
      localStorage.removeItem('hoopscore_user');
      // allow redirect if not already on login page
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
