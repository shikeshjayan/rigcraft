import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const orderService = {
  checkout: async (orderData) => {
    const { data } = await api.post(ENDPOINTS.ORDER.CHECKOUT, orderData);
    return data;
  },

  list: async (params = {}) => {
    const { data } = await api.get(ENDPOINTS.ORDER.LIST, { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ORDER.DETAILS(id));
    return data;
  },

  cancel: async (id, reason) => {
    const { data } = await api.patch(ENDPOINTS.ORDER.CANCEL(id), { reason });
    return data;
  },
};
