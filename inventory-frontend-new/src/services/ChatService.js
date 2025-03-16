import axios from 'axios';
import authHeader from './AuthHeader';

const API_URL = 'http://localhost:8080/api/chat';

class ChatService {
  // Get all chats for current user
  getAllChats() {
    return axios.get(API_URL, { headers: authHeader() });
  }

  // Get recent chats (for the navbar dropdown)
  getRecentChats() {
    return axios.get(`${API_URL}/recent`, { headers: authHeader() });
  }

  // Get count of unread messages
  getUnreadCount() {
    return axios.get(`${API_URL}/unread-count`, { headers: authHeader() });
  }

  // Get info about a specific chat
  getChatInfo(chatId) {
    return axios.get(`${API_URL}/${chatId}`, { headers: authHeader() });
  }

  // Get messages for a specific chat
  getMessages(chatId) {
    return axios.get(`${API_URL}/${chatId}/messages`, { headers: authHeader() });
  }

  // Send a message in a chat
  sendMessage(chatId, content) {
    return axios.post(
      `${API_URL}/${chatId}/messages`, 
      { content },
      { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
    );
  }

  // Mark a chat as read
  markChatAsRead(chatId) {
    return axios.put(
      `${API_URL}/${chatId}/read`,
      {},
      { headers: authHeader() }
    );
  }

  // Create a new chat with another user
  createChat(userId) {
    return axios.post(
      API_URL,
      { participantId: userId },
      { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
    );
  }
}

export default new ChatService();