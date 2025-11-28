// src/utils/auth.js

import { reactive } from 'vue';
import { apiClient, handleApiError } from './client.js';

// Create a reactive state object to hold authentication status and user info
export const authState = reactive({
  isAuthenticated: !!localStorage.getItem('authToken'),
  user: null // We can store user details here later if needed
});

export function setAuthState(isLoggedIn) {
  authState.isAuthenticated = isLoggedIn;
  if (!isLoggedIn) {
    authState.user = null;
    localStorage.removeItem('authToken');
  }
}

// Check token validity on app start
export function initializeAuth() {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      // Basic token expiry check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token expired
        setAuthState(false);
      } else {
        authState.isAuthenticated = true;
      }
    } catch (error) {
      // Invalid token
      setAuthState(false);
    }
  } else {
    authState.isAuthenticated = false;
  }
}

export function registerUser(userData) {
  return apiClient.post('/auth/register', userData)
    .then(res => res.data)
    .catch(handleApiError);
}

export function loginUser(credentials) {
  return apiClient.post('/auth/login', credentials)
    .then(res => res.data)
    .catch(handleApiError);
}

export async function logoutUser() {
  try {
    await apiClient.get('/auth/logout'); // backend logout
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    // update reactive state
    setAuthState(false);
  }
}

export function forgotPassword(email) {
  return apiClient.post(`/forgot-password?email=${encodeURIComponent(email)}`)
    .then(res => res.data)
    .catch(handleApiError);
}

export function resetPassword(token, newPassword) {
  return apiClient.post('/reset-password', { token, newPassword })
    .then(res => res.data)
    .catch(handleApiError);
}
