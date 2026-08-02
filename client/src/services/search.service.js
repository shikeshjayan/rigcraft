import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const searchService = {
  public: async (query) => {
    const { data } = await api.get(ENDPOINTS.SEARCH.PUBLIC, { params: { q: query } });
    return data.data;
  },
};
