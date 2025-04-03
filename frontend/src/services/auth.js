import API from './api';

export const login = (credentials) => API.post('/userProfile/login/', credentials).then(res => res.data);

export const register = (data) => API.post('/userProfile/register/', data).then(res => res.data);

export const logout = (refresh) => API.post('/userProfile/logout/', { refresh });
