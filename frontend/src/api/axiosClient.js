import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
