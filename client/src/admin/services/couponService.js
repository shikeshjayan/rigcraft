import api from "./api";

const useMock = true;

const MOCK_COUPONS = [
  { id: 1, code: "SUMMER2025", type: "percentage", value: 15, minOrder: 100, maxUses: 100, usedCount: 45, isActive: true, startsAt: "2025-06-01T00:00:00Z", expiresAt: "2025-08-31T23:59:59Z", description: "Summer sale 15% off", createdAt: "2025-05-20T10:00:00Z" },
  { id: 2, code: "WELCOME10", type: "fixed", value: 50, minOrder: 200, maxUses: 500, usedCount: 120, isActive: true, startsAt: "2025-01-01T00:00:00Z", expiresAt: "2025-12-31T23:59:59Z", description: "$50 off for new customers", createdAt: "2025-01-01T10:00:00Z" },
  { id: 3, code: "FLASH20", type: "percentage", value: 20, minOrder: 50, maxUses: 50, usedCount: 50, isActive: false, startsAt: "2025-05-01T00:00:00Z", expiresAt: "2025-05-07T23:59:59Z", description: "Flash sale 20% off (expired)", createdAt: "2025-04-28T10:00:00Z" },
  { id: 4, code: "FREESHIPPING", type: "free_shipping", value: 0, minOrder: 0, maxUses: 1000, usedCount: 234, isActive: true, startsAt: "2025-01-01T00:00:00Z", expiresAt: "2025-12-31T23:59:59Z", description: "Free shipping on any order", createdAt: "2025-01-01T10:00:00Z" },
];

let nextId = 5;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const paginate = (data, page, pageSize) => {
  const start = page * pageSize;
  return { data: data.slice(start, start + pageSize), total: data.length };
};

export const couponService = {
  list: async ({ page = 0, pageSize = 10, search = "", isActive = "" } = {}) => {
    if (useMock) {
      await delay(300);
      let filtered = [...MOCK_COUPONS];
      if (search) filtered = filtered.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));
      if (isActive !== "") filtered = filtered.filter((c) => c.isActive === (isActive === "true"));
      return paginate(filtered, page, pageSize);
    }
    const { data } = await api.get("/coupons", { params: { page, pageSize, search, isActive } });
    return data;
  },

  getById: async (id) => {
    if (useMock) {
      await delay(200);
      const coupon = MOCK_COUPONS.find((c) => c.id === id);
      if (!coupon) throw new Error("Coupon not found");
      return coupon;
    }
    const { data } = await api.get(`/coupons/${id}`);
    return data;
  },

  create: async (couponData) => {
    if (useMock) {
      await delay(300);
      const newCoupon = { id: nextId++, ...couponData, usedCount: 0, createdAt: new Date().toISOString() };
      MOCK_COUPONS.push(newCoupon);
      return newCoupon;
    }
    const { data } = await api.post("/coupons", couponData);
    return data;
  },

  update: async (id, couponData) => {
    if (useMock) {
      await delay(300);
      const idx = MOCK_COUPONS.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Coupon not found");
      MOCK_COUPONS[idx] = { ...MOCK_COUPONS[idx], ...couponData };
      return MOCK_COUPONS[idx];
    }
    const { data } = await api.put(`/coupons/${id}`, couponData);
    return data;
  },

  delete: async (id) => {
    if (useMock) {
      await delay(200);
      const idx = MOCK_COUPONS.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Coupon not found");
      MOCK_COUPONS.splice(idx, 1);
      return { success: true };
    }
    const { data } = await api.delete(`/coupons/${id}`);
    return data;
  },
};
