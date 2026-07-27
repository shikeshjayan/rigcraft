import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const addressService = {
  list: async () => {
    const { data } = await api.get(ENDPOINTS.ADDRESS.LIST);
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ADDRESS.DETAILS(id));
    return data;
  },

  create: async (addressData) => {
    const { data } = await api.post(ENDPOINTS.ADDRESS.CREATE, addressData);
    return data;
  },

  update: async (id, addressData) => {
    const { data } = await api.put(ENDPOINTS.ADDRESS.UPDATE(id), addressData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.ADDRESS.DELETE(id));
    return data;
  },

  setDefault: async (id) => {
    const { data } = await api.patch(`${ENDPOINTS.ADDRESS.DETAILS(id)}/default`);
    return data;
  },
};
