import API from './api';

// Send a follow request to a user
export const sendFollowRequest = (userId) =>
  API.post(`/follows/follow/${userId}/`);

// Cancel a follow request
export const cancelFollowRequest = (userId) =>
  API.delete(`/follows/cancel/${userId}/`);

// Accept a follow request
export const acceptFollowRequest = (requestId) =>
  API.post(`/follows/accept/${requestId}/`);

// Unfollow a user
export const unfollowUser = (userId) =>
  API.delete(`/follows/unfollow/${userId}/`);

// Get all follow-related data (followers, following, requests, mutuals)
export const fetchMyFollows = () =>
  API.get('/follows/my-follows/');

// Alias export to match naming in components
export const fetchDetailedFollows = fetchMyFollows;

// Optional: keep the original fetchFollows export if used elsewhere
export const fetchFollows = fetchMyFollows;
