import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const wishlistService = {
  get: async () => {
    const { data } = await api.get(ENDPOINTS.WISHLIST.GET);
    return data;
  },

  addItem: async (item) => {
    const { data } = await api.post(ENDPOINTS.WISHLIST.ADD_ITEM, item);
    return data;
  },

  removeItem: async (itemId) => {
    const { data } = await api.delete(ENDPOINTS.WISHLIST.REMOVE_ITEM(itemId));
    return data;
  },

  clear: async () => {
    const { data } = await api.delete(ENDPOINTS.WISHLIST.CLEAR);
    return data;
  },
};
