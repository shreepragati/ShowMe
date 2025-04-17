// services/chatService.js
import API from './api';

// Fetch all messages between the current user and another user
export const fetchMessages = (otherUsername) => 
  API.get(`/chat/conversation/${otherUsername}/`)
    .then(res => res.data);

// Optionally: send a message via REST (if needed alongside WebSocket)
export const sendMessageAPI = (otherUsername, content) =>
  API.post(`/chat/send/${otherUsername}/`, { content })
    .then(res => res.data);

// Optionally: fetch recent chats or conversation list (if your backend supports it)
export const fetchRecentChats = () =>
  API.get('/chat/recent/')
    .then(res => res.data);
