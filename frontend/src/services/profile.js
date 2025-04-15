import API from './api';

export const fetchProfileWithPosts = (username) =>
  API.get(`/profileview/user/${username}/`);
export const fetchProfile = () => API.get('/profile/edit/');


export const updateProfile = (data) =>
  API.put('/profile/edit/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
