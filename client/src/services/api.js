import axios from 'axios';
import { logMalformedResponse } from './loggingService';

// Create an instance of axios with base configurations
const api = axios.create({
  baseURL: dfi-production-38a9.up.railway.app,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Helper to set auth token on the axios instance
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor: attach Bearer token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor to handle responses globally (e.g. logouts on 401s and 403)
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token')) {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        logMalformedResponse({ endpoint: error.config?.url, status: error.response.status, data: error.response.data });
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.dispatchEvent(new CustomEvent('auth-expired'));
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        const newToken = data.data?.token || data.token; 
        
        if (newToken) {
          localStorage.setItem('authToken', newToken);
          api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          throw new Error('No token returned');
        }
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        logMalformedResponse({ endpoint: error.config?.url, status: error.response?.status, data: error.response?.data });
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.dispatchEvent(new CustomEvent('auth-expired'));
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default api;
