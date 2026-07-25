import api from "./api";

const useMock = true;

const MOCK_USERS_DATA = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "customer", status: "active", orders: 3, totalSpent: 5899.99, registeredAt: "2024-12-01T10:00:00Z", lastLogin: "2025-06-19T08:00:00Z" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "customer", status: "active", orders: 8, totalSpent: 12499.99, registeredAt: "2024-11-15T10:00:00Z", lastLogin: "2025-06-18T14:00:00Z" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "customer", status: "active", orders: 1, totalSpent: 4599.99, registeredAt: "2025-03-20T10:00:00Z", lastLogin: "2025-06-17T09:00:00Z" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", role: "customer", status: "inactive", orders: 2, totalSpent: 329.99, registeredAt: "2025-01-10T10:00:00Z", lastLogin: "2025-05-01T10:00:00Z" },
  { id: 5, name: "Charlie Davis", email: "charlie@example.com", role: "customer", status: "active", orders: 5, totalSpent: 7899.99, registeredAt: "2024-10-05T10:00:00Z", lastLogin: "2025-06-20T07:00:00Z" },
  { id: 10, name: "John Admin", email: "admin@rigcraft.com", role: "admin", status: "active", orders: 0, totalSpent: 0, registeredAt: "2024-06-01T10:00:00Z", lastLogin: "2025-06-20T06:00:00Z" },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const paginate = (data, page, pageSize) => {
  const start = page * pageSize;
  return { data: data.slice(start, start + pageSize), total: data.length };
};

export const userService = {
  list: async ({ page = 0, pageSize = 10, search = "", role = "", status = "" } = {}) => {
    if (useMock) {
      await delay(300);
      let filtered = [...MOCK_USERS_DATA];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      if (role) filtered = filtered.filter((u) => u.role === role);
      if (status) filtered = filtered.filter((u) => u.status === status);
      return paginate(filtered, page, pageSize);
    }
    const { data } = await api.get("/users", { params: { page, pageSize, search, role, status } });
    return data;
  },

  getById: async (id) => {
    if (useMock) {
      await delay(200);
      const user = MOCK_USERS_DATA.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      return user;
    }
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
};
