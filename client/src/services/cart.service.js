import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const cartService = {
  get: async () => {
    const { data } = await api.get(ENDPOINTS.CART.GET);
    return data;
  },

  addItem: async (item) => {
    const { data } = await api.post(ENDPOINTS.CART.ADD_ITEM, item);
    return data;
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await api.put(ENDPOINTS.CART.UPDATE_ITEM(itemId), { quantity });
    return data;
  },

  removeItem: async (itemId) => {
    const { data } = await api.delete(ENDPOINTS.CART.REMOVE_ITEM(itemId));
    return data;
  },

  applyCoupon: async (code) => {
    const { data } = await api.post(ENDPOINTS.CART.APPLY_COUPON, { code });
    return data;
  },

  removeCoupon: async () => {
    const { data } = await api.delete(ENDPOINTS.CART.REMOVE_COUPON);
    return data;
  },

  clear: async () => {
    const { data } = await api.delete(ENDPOINTS.CART.CLEAR);
    return data;
  },
};
