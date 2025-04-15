// src/services/follows.js
import axios from 'axios';

import API from './api';

export const sendFollowRequest = (userId) =>
  API.post(`/follows/follow/${userId}/`);

export const cancelFollowRequest = (userId) =>
  API.delete(`/follows/cancel/${userId}/`);

export const acceptFollowRequest = (requestId) =>
  API.post(`/follows/accept/${requestId}/`);

export const unfollowUser = (userId) =>
  API.delete(`/follows/unfollow/${userId}/`);

export const fetchMyFollows = () =>
  API.get('/follows/my-follows/');

// Export the function so it can be used in the Home component
export const fetchFollows = fetchMyFollows;
