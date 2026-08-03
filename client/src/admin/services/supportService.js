import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalizeTicket = (t) => ({
  ...t,
  id: t._id,
  _id: undefined,
  __v: undefined,
  customer: t.user
    ? {
        id: t.user._id || t.user,
        name: t.user.name || `${t.user.firstName || ""} ${t.user.lastName || ""}`.trim() || "Unknown",
        email: t.user.email,
      }
    : t.customer || { name: "Unknown" },
  user: undefined,
  lastMessage: t.lastMessage
    ? { ...t.lastMessage, _id: undefined, __v: undefined }
    : undefined,
});

const normalizeList = (res) => {
  const docs = res.tickets || res.docs || res.data || [];
  const items = Array.isArray(docs) ? docs.map(normalizeTicket) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

export const supportService = {
  list: async ({ page = 0, pageSize = 10, search = "", status = "", priority = "", issueType = "" } = {}) => {
    const params = {
      page: page + 1,
      limit: pageSize,
    };
    if (search) params.search = search.trim();
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (issueType) params.issueType = issueType;
    const { data } = await api.get(ENDPOINTS.ADMIN_SUPPORT.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ADMIN_SUPPORT.DETAILS(id));
    const { ticket, messages } = data.data || {};
    return { ...normalizeTicket(ticket), messages: messages || [] };
  },

  reply: async (id, message, attachments = []) => {
    const formData = new FormData();
    formData.append("message", message);
    attachments.forEach((file) => formData.append("attachments", file));
    const { data } = await api.post(ENDPOINTS.ADMIN_SUPPORT.REPLY(id), formData);
    return data.data;
  },

  updateStatus: async (id, status) => {
    const { data } = await api.put(ENDPOINTS.ADMIN_SUPPORT.UPDATE_STATUS(id), { status });
    return normalizeTicket(data.data);
  },

  assign: async (id, userId) => {
    const { data } = await api.put(ENDPOINTS.ADMIN_SUPPORT.ASSIGN(id), { assignedTo: userId });
    return normalizeTicket(data.data);
  },

  updatePriority: async (id, priority) => {
    const { data } = await api.put(ENDPOINTS.ADMIN_SUPPORT.PRIORITY(id), { priority });
    return normalizeTicket(data.data);
  },

  cancelOrder: async (orderId) => {
    const { data } = await api.patch(ENDPOINTS.ADMIN_ORDER.UPDATE_STATUS(orderId), { orderStatus: "cancelled" });
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.ADMIN_SUPPORT.DELETE(id));
    return data;
  },
};
