import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create a reusable Axios instance with a base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Add a request interceptor to attach the JWT token to every request
apiClient.interceptors.request.use(
  config => {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // If the token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// A helper function for consistent error handling
const handleApiError = (error) => {
    throw error.response ? error.response.data : error.message;
};

// User Authentication Functions
export function registerUser(userData) {
  return apiClient.post('/register', userData)
    .then(response => response.data)
    .catch(handleApiError);
}

export function loginUser(credentials) {
  return apiClient.post('/login', credentials)
    .then(response => response.data)
    .catch(handleApiError);
}

export function logoutUser() {
  // Remove the token from storage
  localStorage.removeItem('authToken');
  // Update the global state to logged out
  setAuthState(false);
}

export function forgotPassword(email) {
  return apiClient.post(`/forgot-password?email=${encodeURIComponent(email)}`)
    .then(response => response.data)
    .catch(handleApiError);
}

export function resetPassword(token, newPassword) {
  return apiClient.post('/reset-password', { token, newPassword })
    .then(response => response.data)
    .catch(handleApiError);
}

// Friend Management Functions
export function getFriendRequests(status) {
  return apiClient.get(`/friends/requests?status=${status}`)
    .then(res => res.data)
    .catch(handleApiError);
}

export function sendFriendRequest(receiverName, receiverTag) {
  return apiClient.post('/friends/request', { receiverName, receiverTag })
    .then(res => res.data)
    .catch(handleApiError);
}

export function respondToFriendRequest(requestId, action) {
  return apiClient.post('/friends/requests/respond', { requestId, action })
    .then(res => res.data)
    .catch(handleApiError);
}

export function getFriends() {
  // This function calls the new endpoint you created in the controller
  return apiClient.get('/friends/friend-list')
    .then(res => res.data)
    .catch(handleApiError);
}

// Chat Functions
export function getConversations() {
  return apiClient.get('/chat/conversations')
    .then(res => res.data)
    .catch(handleApiError);
}

export function getChatHistory(friendId, page = 0, size = 50) {
  return apiClient.get(`/chat/messages/${friendId}?page=${page}&size=${size}`)
    .then(res => res.data)
    .catch(handleApiError);
}

export function getCurrentUser() {
  return apiClient.get('/user/profile')
    .then(res => res.data)
    .catch(handleApiError);
}

// Utility function to decode JWT token
export function decodeToken(token) {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

// Get current user email from token
export function getCurrentUserEmail() {
  const token = localStorage.getItem('authToken');
  const decoded = decodeToken(token);
  return decoded?.sub || null;
}

// Get current user ID (you might need to implement an endpoint for this)
export function getCurrentUserId() {
  // This would require either storing user ID in token or making an API call
  // For now, return null and implement proper user profile fetching
  return null;
}