import api from "../../shared/api/axios";

const useMock = true;

const MOCK_ORDERS = [
  { id: 1, orderNumber: "ORD-2025-0001", customer: { id: 1, name: "John Doe", email: "john@example.com" }, status: "delivered", items: 3, total: 2599.99, paymentMethod: "Credit Card", shippingAddress: "123 Main St, New York, NY 10001", notes: "", createdAt: "2025-06-15T10:30:00Z", updatedAt: "2025-06-20T14:00:00Z" },
  { id: 2, orderNumber: "ORD-2025-0002", customer: { id: 2, name: "Jane Smith", email: "jane@example.com" }, status: "processing", items: 2, total: 1899.99, paymentMethod: "PayPal", shippingAddress: "456 Oak Ave, Los Angeles, CA 90001", notes: "Handle with care", createdAt: "2025-06-18T09:15:00Z", updatedAt: "2025-06-19T11:30:00Z" },
  { id: 3, orderNumber: "ORD-2025-0003", customer: { id: 3, name: "Bob Wilson", email: "bob@example.com" }, status: "shipped", items: 5, total: 4599.99, paymentMethod: "Credit Card", shippingAddress: "789 Pine Rd, Chicago, IL 60601", notes: "", createdAt: "2025-06-17T14:00:00Z", updatedAt: "2025-06-19T16:00:00Z" },
  { id: 4, orderNumber: "ORD-2025-0004", customer: { id: 1, name: "John Doe", email: "john@example.com" }, status: "pending", items: 1, total: 589.99, paymentMethod: "Bank Transfer", shippingAddress: "123 Main St, New York, NY 10001", notes: "", createdAt: "2025-06-20T08:00:00Z", updatedAt: "2025-06-20T08:00:00Z" },
  { id: 5, orderNumber: "ORD-2025-0005", customer: { id: 4, name: "Alice Brown", email: "alice@example.com" }, status: "cancelled", items: 2, total: 329.99, paymentMethod: "PayPal", shippingAddress: "321 Elm St, Miami, FL 33101", notes: "Customer requested cancellation", createdAt: "2025-06-14T11:00:00Z", updatedAt: "2025-06-15T09:00:00Z" },
  { id: 6, orderNumber: "ORD-2025-0006", customer: { id: 5, name: "Charlie Davis", email: "charlie@example.com" }, status: "confirmed", items: 4, total: 1899.99, paymentMethod: "Credit Card", shippingAddress: "654 Maple Dr, Seattle, WA 98101", notes: "", createdAt: "2025-06-19T16:30:00Z", updatedAt: "2025-06-19T17:00:00Z" },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const paginate = (data, page, pageSize) => {
  const start = page * pageSize;
  return { data: data.slice(start, start + pageSize), total: data.length };
};

export const orderService = {
  list: async ({ page = 0, pageSize = 10, search = "", status = "" } = {}) => {
    if (useMock) {
      await delay(300);
      let filtered = [...MOCK_ORDERS];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q));
      }
      if (status) filtered = filtered.filter((o) => o.status === status);
      return paginate(filtered, page, pageSize);
    }
    const { data } = await api.get("/admin/orders", { params: { page, pageSize, search, status } });
    return data;
  },

  getById: async (id) => {
    if (useMock) {
      await delay(200);
      const order = MOCK_ORDERS.find((o) => o.id === id);
      if (!order) throw new Error("Order not found");
      return order;
    }
    const { data } = await api.get(`/admin/orders/${id}`);
    return data;
  },

  updateStatus: async (id, status) => {
    if (useMock) {
      await delay(200);
      const idx = MOCK_ORDERS.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error("Order not found");
      MOCK_ORDERS[idx].status = status;
      MOCK_ORDERS[idx].updatedAt = new Date().toISOString();
      return MOCK_ORDERS[idx];
    }
    const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
    return data;
  },
};
