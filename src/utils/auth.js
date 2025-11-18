// src/utils/auth.js

import { reactive } from 'vue';

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