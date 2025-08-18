import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export function registerUser(userData) {
  return axios.post(`${API_BASE_URL}/register`, userData)
    .then(response => response.data)
    .catch(error =>  {
      throw error.response ? error.response.data : error.message;
    });
}

export function loginUser(credentials) {
  return axios.post(`${API_BASE_URL}/login`, credentials)
    .then(response => response.data)
    .catch(error =>  {
      throw error.response ? error.response.data : error.message;
    });
}

export function forgotPassword(email) {
  return axios.post(`${API_BASE_URL}/forgot-password?email=${encodeURIComponent(email)}`)
    .then(response => response.data)
    .catch(error =>  {
      throw error.response ? error.response.data : error.message;
    });
}

export function resetPassword(token, newPassword) {
  // Send as JSON in request body (Recommended and secure)
  return axios.post(`${API_BASE_URL}/reset-password`, {
    token: token,
    newPassword: newPassword
  })
    .then(response => response.data)
    .catch(error => {
      throw error.response ? error.response.data : error.message;
    });
}