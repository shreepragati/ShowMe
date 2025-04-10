import API from './api';

export const fetchProfile = () => API.get('/profile/edit/');

export const updateProfile = (data) =>
  API.put('/profile/edit/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
