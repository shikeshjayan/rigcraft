import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
    return data;
  },

  logout: async () => {
    const { data } = await api.post(ENDPOINTS.AUTH.LOGOUT);
    return data;
  },

  refreshToken: async () => {
    const { data } = await api.post(ENDPOINTS.AUTH.REFRESH);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get(ENDPOINTS.AUTH.PROFILE);
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put(ENDPOINTS.AUTH.PROFILE, profileData);
    return data;
  },

  changePassword: async (passwordData) => {
    const { data } = await api.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return data;
  },

  resetPassword: async (resetData) => {
    const { data } = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
    return data;
  },

  checkAccount: async (identifier) => {
    const { data } = await api.post(ENDPOINTS.AUTH.CHECK, { identifier });
    return data;
  },
};
