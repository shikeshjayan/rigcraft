import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const brandService = {
  list: async (params = {}) => {
    const { data } = await api.get(ENDPOINTS.BRAND.LIST, { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.BRAND.DETAILS(id));
    return data;
  },
};
