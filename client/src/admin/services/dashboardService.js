import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

export const dashboardService = {
  getStats: async () => {
    const { data } = await api.get(ENDPOINTS.DASHBOARD.STATS);
    return data.data;
  },

  getSalesData: async (period = "yearly") => {
    const { data } = await api.get(ENDPOINTS.DASHBOARD.SALES, { params: { period } });
    return data.data;
  },

  getRecentOrders: async (limit = 5) => {
    const { data } = await api.get(ENDPOINTS.DASHBOARD.RECENT_ORDERS, { params: { limit } });
    return data.data;
  },

  getLowStockProducts: async (limit = 10) => {
    const { data } = await api.get(ENDPOINTS.DASHBOARD.LOW_STOCK_PRODUCTS, { params: { limit } });
    return data.data;
  },

  getTopProducts: async (limit = 5) => {
    const { data } = await api.get(ENDPOINTS.DASHBOARD.TOP_PRODUCTS, { params: { limit } });
    return data.data;
  },

  getOrderBreakdown: async () => {
    const { data } = await api.get(ENDPOINTS.DASHBOARD.ORDER_BREAKDOWN);
    return data.data;
  },
};
