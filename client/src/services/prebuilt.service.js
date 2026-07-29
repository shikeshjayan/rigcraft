import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const prebuiltService = {
  list: async (params = {}) => {
    const { data } = await api.get(ENDPOINTS.PREBUILT.LIST, { params });
    return data;
  },

  getBySlug: async (slug) => {
    const { data } = await api.get(ENDPOINTS.PREBUILT.DETAILS(slug));
    return data;
  },

  getFeatured: async () => {
    const { data } = await api.get(ENDPOINTS.PREBUILT.FEATURED);
    return data;
  },

  getByCategory: async (category, params = {}) => {
    const { data } = await api.get(ENDPOINTS.PREBUILT.CATEGORY(category), { params });
    return data;
  },

  getSimilar: async (slugOrId, params = {}) => {
    const { data } = await api.get(ENDPOINTS.PREBUILT.SIMILAR(slugOrId), { params });
    return data;
  },

  getComponentProducts: async (slugOrId) => {
    const { data } = await api.get(ENDPOINTS.PREBUILT.COMPONENTS(slugOrId));
    return data;
  },
};
