import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalizeFaq = (f) => ({
  ...f,
  id: f._id,
  _id: undefined,
  __v: undefined,
});

const normalizeList = (res) => {
  const docs = res.faqs || res.docs || res.data || [];
  const items = Array.isArray(docs) ? docs.map(normalizeFaq) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

export const faqService = {
  list: async ({ page = 0, pageSize = 10, search = "" } = {}) => {
    const params = { page: page + 1, limit: pageSize };
    if (search) params.search = search.trim();
    const { data } = await api.get(ENDPOINTS.ADMIN_FAQ.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ADMIN_FAQ.DETAILS(id));
    return normalizeFaq(data.data);
  },

  create: async (faqData) => {
    const { data } = await api.post(ENDPOINTS.ADMIN_FAQ.CREATE, faqData);
    return normalizeFaq(data.data);
  },

  update: async (id, faqData) => {
    const { data } = await api.put(ENDPOINTS.ADMIN_FAQ.UPDATE(id), faqData);
    return normalizeFaq(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.ADMIN_FAQ.DELETE(id));
    return data;
  },
};
