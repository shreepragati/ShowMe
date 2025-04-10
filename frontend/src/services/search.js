// services/search.js
import axios from 'axios';
import { getAuthHeaders } from './auth'; // assuming you handle JWT here

export const searchUsers = async (query) => {
  const response = await axios.get(`http://127.0.0.1:8000/search/users/?q=${query}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};
