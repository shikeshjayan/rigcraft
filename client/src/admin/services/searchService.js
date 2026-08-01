import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

export const searchService = {
  admin: async (query) => {
    const { data } = await api.get(ENDPOINTS.SEARCH.ADMIN, { params: { q: query } });
    return data.data;
  },
};
