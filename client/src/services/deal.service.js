import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const dealService = {
  list: async (params = {}) => {
    const { data } = await api.get(ENDPOINTS.DEAL.LIST, { params });
    return data;
  },

  getActive: async () => {
    const { data } = await api.get(ENDPOINTS.DEAL.ACTIVE);
    return data;
  },

  getBySlug: async (slug) => {
    const { data } = await api.get(ENDPOINTS.DEAL.DETAILS(slug));
    return data;
  },
};
