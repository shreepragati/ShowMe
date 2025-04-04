import API from './api';

export const fetchFriendList = () => API.get('/friends/list/');
export const sendFriendRequest = (userId) =>
  API.post(`/friends/send-request/${userId}/`);
export const acceptFriendRequest = (requestId) =>
  API.post(`/friends/accept-request/${requestId}/`);
