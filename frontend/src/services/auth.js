import API from './api';

export const login = (credentials) => API.post('/login/', credentials).then(res => res.data);

export const register = (data) => API.post('/register/', data).then(res => res.data);

export const logout = (refresh) => API.post('/logout/', { refresh });
