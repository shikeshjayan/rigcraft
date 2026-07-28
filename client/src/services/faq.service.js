import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const faqService = {
  getFaqs: async () => {
    const { data } = await api.get(ENDPOINTS.FAQ.LIST);
    return data;
  },
};
