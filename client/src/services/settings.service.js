import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const getPublicSettings = async () => {
  const { data } = await api.get(ENDPOINTS.SETTINGS.PUBLIC);
  return data.data;
};
