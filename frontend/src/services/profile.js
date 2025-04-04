import API from './api';

export const fetchProfile = () => API.get('/userProfile/profile/edit/');

export const updateProfile = (data) =>
  API.put('/userProfile/profile/edit/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
