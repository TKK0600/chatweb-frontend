import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export function registerUser(userData) {
  return axios.post(`${API_BASE_URL}/register`, userData)
    .then(response => response.data)
    .catch(error =>  {
      throw error.response ? error.response.data : error.message;
    });
}