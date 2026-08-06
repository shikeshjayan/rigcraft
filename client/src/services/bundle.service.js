import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const bundleService = {
  getActive: async () => {
    const { data } = await api.get(ENDPOINTS.BUNDLE.ACTIVE);
    return data;
  },

  getBySlug: async (slug) => {
    const { data } = await api.get(ENDPOINTS.BUNDLE.DETAILS(slug));
    return data;
  },
};
