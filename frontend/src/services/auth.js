import API from './api';

export const login = (credentials) => API.post('/login/', credentials).then(res => res.data);

export const register = (data) => API.post('/register/', data).then(res => res.data);

export const logout = (refresh) => API.post('/logout/', { refresh });

// auth.js

export const getAuthHeaders = () => {
    const token = localStorage.getItem('access'); // or sessionStorage, depending on your flow
    return {
      Authorization: `Bearer ${token}`
    };
  };
  