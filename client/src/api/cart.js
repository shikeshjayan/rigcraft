import apiClient from './client';

export const getCart = async () => {
  const response = await apiClient.get('/cart');
  return response.data;
};

export const addToCartApi = async (itemType, itemId, quantity = 1) => {
  const response = await apiClient.post('/cart/items', { itemType, itemId, quantity });
  return response.data;
};

export const removeFromCartApi = async (itemId) => {
  const response = await apiClient.delete(`/cart/items/${itemId}`);
  return response.data;
};

export const updateCartItemApi = async (itemId, quantity) => {
  const response = await apiClient.put(`/cart/items/${itemId}`, { quantity });
  return response.data;
};

export const clearCartApi = async () => {
  const response = await apiClient.delete('/cart');
  return response.data;
};
