import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const useMock = true;

const MOCK_STATS = {
  totalRevenue: 158920.50,
  totalOrders: 1247,
  totalProducts: 284,
  totalCustomers: 892,
  revenueChange: 12.5,
  ordersChange: 8.3,
  productsChange: -2.1,
  customersChange: 15.7,
};

const MOCK_SALES = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleString("default", { month: "short" }),
  revenue: Math.floor(Math.random() * 50000) + 10000,
  orders: Math.floor(Math.random() * 200) + 50,
}));

const MOCK_RECENT_ORDERS = [
  { id: 1, orderNumber: "ORD-2025-0001", customer: { name: "John Doe" }, status: "delivered", total: 2599.99, createdAt: "2025-06-20T10:30:00Z" },
  { id: 2, orderNumber: "ORD-2025-0002", customer: { name: "Jane Smith" }, status: "processing", total: 1899.99, createdAt: "2025-06-19T09:15:00Z" },
  { id: 3, orderNumber: "ORD-2025-0003", customer: { name: "Bob Wilson" }, status: "shipped", total: 4599.99, createdAt: "2025-06-18T14:00:00Z" },
  { id: 4, orderNumber: "ORD-2025-0004", customer: { name: "Alice Brown" }, status: "pending", total: 589.99, createdAt: "2025-06-18T08:00:00Z" },
  { id: 5, orderNumber: "ORD-2025-0005", customer: { name: "Charlie Davis" }, status: "confirmed", total: 1299.99, createdAt: "2025-06-17T16:30:00Z" },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const dashboardService = {
  getStats: async () => {
    if (useMock) {
      await delay(400);
      return MOCK_STATS;
    }
    const { data } = await api.get(ENDPOINTS.DASHBOARD.STATS);
    return data;
  },

  getSalesData: async (period = "yearly") => {
    if (useMock) {
      await delay(300);
      return MOCK_SALES;
    }
    const { data } = await api.get(ENDPOINTS.DASHBOARD.SALES, { params: { period } });
    return data;
  },

  getRecentOrders: async (limit = 5) => {
    if (useMock) {
      await delay(300);
      return MOCK_RECENT_ORDERS.slice(0, limit);
    }
    const { data } = await api.get(ENDPOINTS.DASHBOARD.RECENT_ORDERS, { params: { limit } });
    return data;
  },
};
