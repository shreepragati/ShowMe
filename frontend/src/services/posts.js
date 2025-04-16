import API from './api';

export const getPosts = () => API.get('/posts/posts/'); // ✅ no need to pass token

export const createPost = (formData) =>
  API.post('/posts/posts/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// ✅ NEW: Delete post by ID
export const deletePost = (postId) =>
  API.delete(`/posts/posts/${postId}/`);
