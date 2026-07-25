import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const productService = {
  list: async (params = {}) => {
    const { data } = await api.get(ENDPOINTS.PRODUCT.LIST, { params });
    return data;
  },

  getBySlug: async (slug) => {
    const { data } = await api.get(ENDPOINTS.PRODUCT.DETAILS(slug));
    return data;
  },

  getFeatured: async () => {
    const { data } = await api.get(`${ENDPOINTS.PRODUCT.LIST}/featured`);
    return data;
  },

  getRelated: async (slug) => {
    const { data } = await api.get(`${ENDPOINTS.PRODUCT.LIST}/${slug}/related`);
    return data;
  },
};
