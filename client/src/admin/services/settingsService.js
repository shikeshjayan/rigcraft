import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

export const settingsService = {
  get: async () => {
    const { data } = await api.get(ENDPOINTS.SETTINGS.GET);
    return data.data;
  },

  getPublic: async () => {
    const { data } = await api.get(ENDPOINTS.SETTINGS.PUBLIC);
    return data.data;
  },

  update: async (settingsData) => {
    const { data } = await api.put(ENDPOINTS.SETTINGS.UPDATE, settingsData);
    return data.data;
  },
};
