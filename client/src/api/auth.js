import apiClient from './client';

export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await apiClient.post('/auth/login', userData);
  return response.data;
};

export const sendOtp = async (userData) => {
  const response = await apiClient.post('/auth/login', userData);
  return response.data;
};

export const checkAccount = async (identifier) => {
  const response = await apiClient.post('/auth/check', { identifier });
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};
