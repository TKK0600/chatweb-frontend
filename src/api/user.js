import { apiClient, handleApiError } from './client.js';

export function getCurrentUser() {
  return apiClient.get('/user/profile')
    .then(res => res.data)
    .catch(handleApiError);
}
