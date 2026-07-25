import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const categoryService = {
  list: async (params = {}) => {
    const { data } = await api.get(ENDPOINTS.CATEGORY.LIST, { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.CATEGORY.DETAILS(id));
    return data;
  },
};
