import { apiClient, handleApiError } from './client.js';

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
