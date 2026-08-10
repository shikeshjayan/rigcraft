import apiClient from './client';

export const subscribeStockAlert = async (itemType, itemId) => {
  const response = await apiClient.post('/stock-alerts', { itemType, itemId });
  return response.data;
};
