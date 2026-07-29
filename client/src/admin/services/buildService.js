import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalizeBuild = (b) => ({
  ...b,
  id: b._id,
  _id: undefined,
  __v: undefined,
});

const normalizeList = (res) => {
  const docs = res.data || res.docs || res.builds || [];
  const items = Array.isArray(docs) ? docs.map(normalizeBuild) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

export const buildService = {
  list: async ({ page = 0, pageSize = 10, search = "" } = {}) => {
    const params = { page: page + 1, limit: pageSize };
    if (search) params.search = search.trim();
    const { data } = await api.get(ENDPOINTS.ADMIN_BUILDER.LIST, { params });
    return normalizeList(data.data);
  },

  getAnalytics: async () => {
    const { data } = await api.get(ENDPOINTS.ADMIN_BUILDER.ANALYTICS);
    return data.data;
  },

  getCompatibilityIssues: async () => {
    const { data } = await api.get(ENDPOINTS.ADMIN_BUILDER.ISSUES);
    return data.data;
  },

  updateSettings: async (settingsData) => {
    const { data } = await api.post(ENDPOINTS.ADMIN_BUILDER.SETTINGS, settingsData);
    return data.data;
  },
};
