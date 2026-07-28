import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const supportService = {
  createTicket: async (ticketData, attachments = []) => {
    const formData = new FormData();
    formData.append("subject", ticketData.subject);
    formData.append("description", ticketData.description || ticketData.message);
    if (ticketData.order) formData.append("order", ticketData.order);
    if (ticketData.issueType || ticketData.category) {
      formData.append("issueType", ticketData.issueType || ticketData.category);
    }
    attachments.forEach((file) => formData.append("attachments", file));
    const { data } = await api.post(ENDPOINTS.SUPPORT.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getTickets: async ({ page = 1, limit = 20 } = {}) => {
    const { data } = await api.get(ENDPOINTS.SUPPORT.LIST, {
      params: { page, limit },
    });
    return data;
  },

  getTicket: async (id) => {
    const { data } = await api.get(ENDPOINTS.SUPPORT.DETAILS(id));
    return data;
  },

  sendMessage: async (ticketId, message, attachments = []) => {
    const formData = new FormData();
    formData.append("message", message);
    attachments.forEach((file) => formData.append("attachments", file));
    const { data } = await api.post(ENDPOINTS.SUPPORT.MESSAGES(ticketId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  closeTicket: async (ticketId) => {
    const { data } = await api.put(ENDPOINTS.SUPPORT.CLOSE(ticketId));
    return data;
  },
};
