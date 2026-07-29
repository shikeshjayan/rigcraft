import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalize = (n) => ({
  ...n,
  id: n._id,
  _id: undefined,
  __v: undefined,
});

const normalizeList = (res) => {
  const docs = res.notifications || res.docs || res.data || [];
  const items = Array.isArray(docs) ? docs.map(normalize) : [];
  return {
    data: items,
    unreadCount: res.unreadCount ?? 0,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

export const notificationService = {
  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ADMIN_NOTIFICATION.DETAILS(id));
    return normalize(data.data);
  },
  list: async ({ page = 0, pageSize = 10 } = {}) => {
    const params = { page: page + 1, limit: pageSize };
    const { data } = await api.get(ENDPOINTS.ADMIN_NOTIFICATION.LIST, { params });
    return normalizeList(data.data);
  },

  getUnreadCount: async () => {
    const { data } = await api.get(ENDPOINTS.ADMIN_NOTIFICATION.UNREAD);
    return data.data?.count ?? 0;
  },

  markAsRead: async (id) => {
    const { data } = await api.put(ENDPOINTS.ADMIN_NOTIFICATION.MARK_READ(id));
    return normalize(data.data);
  },

  markAllAsRead: async () => {
    const { data } = await api.put(ENDPOINTS.ADMIN_NOTIFICATION.MARK_ALL_READ);
    return data;
  },
};
