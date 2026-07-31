import apiClient from './client';

export const getWishlist = async () => {
  const response = await apiClient.get('/wishlist');
  return response.data;
};

export const addToWishlistApi = async (itemType, itemId) => {
  const response = await apiClient.post('/wishlist', { itemType, itemId });
  return response.data;
};

export const removeFromWishlistApi = async (itemId) => {
  const response = await apiClient.delete(`/wishlist/${itemId}`);
  return response.data;
};

export const clearWishlistApi = async () => {
  const response = await apiClient.delete('/wishlist');
  return response.data;
};

export const moveToCartApi = async (itemId) => {
  const response = await apiClient.post(`/wishlist/${itemId}/move-to-cart`);
  return response.data;
};
