import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const buildService = {
  list: async (params = {}) => {
    const { data } = await api.get(ENDPOINTS.BUILDER.LIST, { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.BUILDER.DETAILS(id));
    return data;
  },

  create: async (buildData) => {
    const { data } = await api.post(ENDPOINTS.BUILDER.CREATE, buildData);
    return data;
  },

  update: async (id, buildData) => {
    const { data } = await api.put(ENDPOINTS.BUILDER.UPDATE(id), buildData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.BUILDER.DELETE(id));
    return data;
  },

  duplicate: async (id) => {
    const { data } = await api.post(ENDPOINTS.BUILDER.DUPLICATE(id));
    return data;
  },

  validate: async (id) => {
    const { data } = await api.post(ENDPOINTS.BUILDER.VALIDATE(id));
    return data;
  },

  addToCart: async (id) => {
    const { data } = await api.post(ENDPOINTS.BUILDER.ADD_TO_CART(id));
    return data;
  },
};
