import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalizeDeal = (d) => ({
  ...d,
  id: d._id,
  _id: undefined,
  __v: undefined,
});

const normalizeList = (res) => {
  const docs = res.data || res.docs || res.deals || [];
  const items = Array.isArray(docs) ? docs.map(normalizeDeal) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

export const dealService = {
  list: async ({ page = 0, pageSize = 10, search = "" } = {}) => {
    const params = { page: page + 1, limit: pageSize };
    if (search) params.search = search.trim();
    const { data } = await api.get(ENDPOINTS.ADMIN_DEAL.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ADMIN_DEAL.DETAILS(id));
    return normalizeDeal(data.data);
  },

  create: async (dealData) => {
    const payload = { ...dealData };
    delete payload.id;
    delete payload._id;
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    if (dealData.banner instanceof File) {
      fd.append("banner", dealData.banner);
    }
    const { data } = await api.post(ENDPOINTS.ADMIN_DEAL.CREATE, fd);
    return normalizeDeal(data.data);
  },

  update: async (id, dealData) => {
    const payload = { ...dealData };
    delete payload.id;
    delete payload._id;
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    if (dealData.banner instanceof File) {
      fd.append("banner", dealData.banner);
    }
    const { data } = await api.put(ENDPOINTS.ADMIN_DEAL.UPDATE(id), fd);
    return normalizeDeal(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.ADMIN_DEAL.DELETE(id));
    return data;
  },

  deleteEnded: async () => {
    const { data } = await api.delete(ENDPOINTS.ADMIN_DEAL.DELETE_ENDED);
    return data;
  },
};
