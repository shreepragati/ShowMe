import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000';

const API = axios.create({ baseURL });

// Inject access token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle automatic token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh')
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(`${baseURL}/token/refresh/`, {
          refresh: localStorage.getItem('refresh'),
        });

        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);

        // Retry the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return API(originalRequest);
      } catch (err) {
        // Refresh token also expired → force logout
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default API;
