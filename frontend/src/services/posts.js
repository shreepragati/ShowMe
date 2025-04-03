import API from './api';

export const getPosts = () => API.get('/posts/posts/');
export const createPost = (formData) =>
  API.post('/posts/posts/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
