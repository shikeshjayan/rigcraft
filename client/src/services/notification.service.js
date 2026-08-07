import apiClient from "../api/client";

const normalizeNotification = (n) => ({
  ...n,
  id: n._id,
});

export const notificationService = {
  getNotifications: async ({ page = 1, limit = 20 } = {}) => {
    const { data } = await apiClient.get("/notifications", {
      params: { page, limit },
    });
    return {
      notifications: (data.data?.notifications || []).map(normalizeNotification),
      unreadCount: data.data?.unreadCount || 0,
      pagination: data.data?.pagination || {
        page,
        limit,
        total: 0,
        pages: 1,
      },
    };
  },

  getUnreadCount: async () => {
    const { data } = await apiClient.get("/notifications/unread");
    return data.data?.count ?? 0;
  },

  markAsRead: async (id) => {
    const { data } = await apiClient.put(`/notifications/${id}/read`);
    return data.data;
  },

  markAllAsRead: async () => {
    const { data } = await apiClient.put("/notifications/read-all");
    return data.data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/notifications/${id}`);
    return data.data;
  },
};

export default notificationService;
