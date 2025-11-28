import { apiClient, handleApiError } from './client.js';

export function getFriendRequests(status) {
  return apiClient.get(`/friend/request?status=${status}`)
    .then(res => res.data)
    .catch(handleApiError);
}

export function sendFriendRequest(receiverName, receiverTag) {
  return apiClient.post('/friend/request', { receiverName, receiverTag })
    .then(res => res.data)
    .catch(handleApiError);
}

export function respondToFriendRequest(requestId, action) {
  return apiClient.post('/friend/request/respond', { requestId, action })
    .then(res => res.data)
    .catch(handleApiError);
}

export function getFriends() {
  const token = localStorage.getItem('authToken');
  console.log('Sending token with request:', token);
  return apiClient.get('/friends/friend-list')
    .then(res => res.data)
    .catch(handleApiError);
}

export function deleteFriend(currentUserId, friendId) {
  return apiClient.delete('/friends/delete', {
    data: {
      currentUserId,
      friendId
    }
  })
    .then(res => res.data)
    .catch(handleApiError);
}
