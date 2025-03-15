import axios from 'axios';
import authHeader from './AuthHeader';

const API_URL = 'http://localhost:8080/api/notifications';

class NotificationService {
  getUserNotifications() {
    return axios.get(API_URL, { headers: authHeader() });
  }

  getUnreadNotifications() {
    return axios.get(API_URL + '/unread', { headers: authHeader() });
  }

  getUnreadCount() {
    return axios.get(API_URL + '/count-unread', { headers: authHeader() });
  }

  markAsRead(id) {
    return axios.put(`${API_URL}/${id}/mark-read`, {}, { headers: authHeader() });
  }

  markAllAsRead() {
    return axios.put(API_URL + '/mark-all-read', {}, { headers: authHeader() });
  }

  deleteNotification(id) {
    return axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
  }
}

export default new NotificationService();