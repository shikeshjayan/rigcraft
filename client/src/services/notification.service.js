import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const notificationService = {
  getNotifications: async ({ page = 1, limit = 20 } = {}) => {
    const { data } = await api.get(ENDPOINTS.NOTIFICATION.LIST, {
      params: { page, limit },
    });
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get(ENDPOINTS.NOTIFICATION.UNREAD);
    return data;
  },

  markAsRead: async (id) => {
    const { data } = await api.put(ENDPOINTS.NOTIFICATION.MARK_READ(id));
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put(ENDPOINTS.NOTIFICATION.MARK_ALL_READ);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.NOTIFICATION.DELETE(id));
    return data;
  },
};
