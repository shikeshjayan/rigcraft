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

export const updateCart = async (cart) => {
  const response = await apiClient.put('/auth/cart', { cart });
  return response.data;
};

export const updateWishlist = async (wishlist) => {
  const response = await apiClient.put('/auth/wishlist', { wishlist });
  return response.data;
};
