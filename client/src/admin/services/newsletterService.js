import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalize = (s) => ({
  ...s,
  id: s._id,
  _id: undefined,
  __v: undefined,
  subscribedAt: s.subscribedAt || s.createdAt,
});

const normalizeList = (res) => {
  const docs = res.subscribers || res.docs || res.data || [];
  const items = Array.isArray(docs) ? docs.map(normalize) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

const adaptParams = (params) => {
  const p = { ...params };
  p.page = (p.page || 0) + 1;
  p.limit = p.pageSize;
  delete p.pageSize;
  if (p.search) p.search = p.search.trim();
  Object.keys(p).forEach((k) => {
    if (p[k] === "" || p[k] === undefined || p[k] === null) delete p[k];
  });
  return p;
};

export const newsletterService = {
  list: async ({ page = 0, pageSize = 10, search = "", status = "" } = {}) => {
    const params = adaptParams({ page, pageSize, search, status });
    const { data } = await api.get(ENDPOINTS.NEWSLETTER.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.NEWSLETTER.DETAILS(id));
    return normalize(data.data);
  },

  update: async (id, subscriberData) => {
    const { data } = await api.put(ENDPOINTS.NEWSLETTER.UPDATE(id), subscriberData);
    return normalize(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.NEWSLETTER.DELETE(id));
    return data;
  },

  exportCsv: async (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    const { data } = await api.get(ENDPOINTS.NEWSLETTER.EXPORT, { params });
    return data.data || [];
  },
};
