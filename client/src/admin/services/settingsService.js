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

  uploadLogo: async (file) => {
    const fd = new FormData();
    fd.append("logo", file);
    const { data } = await api.post(ENDPOINTS.SETTINGS.LOGO, fd);
    return data.data;
  },

  deleteLogo: async () => {
    const { data } = await api.delete(ENDPOINTS.SETTINGS.LOGO);
    return data.data;
  },
};
