import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor: global error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401) console.error('Unauthorized access - please log in');
      else if (error.response.status === 403) console.error('Forbidden - you do not have permission');
      else if (error.response.status >= 500) console.error('Server error - please try again later');
    } else if (error.request) console.error('No response from server - check connection');
    else console.error('Request error:', error.message);

    return Promise.reject(error);
  }
);

// Helper function for consistent error handling
export const handleApiError = (error) => {
  throw error.response ? error.response.data : error.message;
};
