import api from "./api";

const useMock = true;

const MOCK_PREBUILT = [
  { id: 1, name: "Ultimate Gaming Beast", slug: "ultimate-gaming-beast", sku: "PB-001", description: "Top-of-the-line gaming PC with RTX 4090 and i9-14900K", shortDescription: "The ultimate 4K gaming machine", price: 3999.99, comparePrice: 4499.99, isActive: true, isFeatured: true, image: null, stock: 5, components: { processor: 1, graphics_card: 3, memory: 4, storage: 5, motherboard: null, power_supply: null, cooling: null, case: null }, tags: ["gaming", "flagship", "4k"], createdAt: "2025-03-01T10:00:00Z", updatedAt: "2025-06-20T08:00:00Z" },
  { id: 2, name: "Pro Creator Workstation", slug: "pro-creator-workstation", sku: "PB-002", description: "High-performance workstation for content creators", shortDescription: "Built for creators who demand the best", price: 2999.99, comparePrice: null, isActive: true, isFeatured: false, image: null, stock: 3, components: { processor: 2, graphics_card: 3, memory: 4, storage: 5, motherboard: null, power_supply: null, cooling: null, case: null }, tags: ["creator", "workstation", "performance"], createdAt: "2025-03-15T10:00:00Z", updatedAt: "2025-06-19T09:00:00Z" },
  { id: 3, name: "Value Gaming Rig", slug: "value-gaming-rig", sku: "PB-003", description: "Affordable gaming PC that delivers great performance", shortDescription: "Best bang for your buck gaming", price: 1499.99, comparePrice: 1699.99, isActive: true, isFeatured: false, image: null, stock: 12, components: { processor: null, graphics_card: null, memory: null, storage: null, motherboard: null, power_supply: null, cooling: null, case: null }, tags: ["gaming", "value", "1080p"], createdAt: "2025-04-01T10:00:00Z", updatedAt: "2025-06-18T10:00:00Z" },
];

let nextId = 4;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const paginate = (data, page, pageSize) => {
  const start = page * pageSize;
  return { data: data.slice(start, start + pageSize), total: data.length };
};

const COMPONENT_SLOTS = [
  { key: "processor", label: "Processor (CPU)", categoryType: "processor", required: true },
  { key: "graphics_card", label: "Graphics Card (GPU)", categoryType: "graphics_card", required: true },
  { key: "memory", label: "Memory (RAM)", categoryType: "memory", required: true },
  { key: "storage", label: "Storage", categoryType: "storage", required: true },
  { key: "motherboard", label: "Motherboard", categoryType: "motherboard", required: false },
  { key: "power_supply", label: "Power Supply (PSU)", categoryType: "power_supply", required: false },
  { key: "cooling", label: "Cooling", categoryType: "cooling", required: false },
  { key: "case", label: "Case", categoryType: "case", required: false },
];

export { COMPONENT_SLOTS };

export const prebuiltService = {
  list: async ({ page = 0, pageSize = 10, search = "", isActive = "" } = {}) => {
    if (useMock) {
      await delay(300);
      let filtered = [...MOCK_PREBUILT];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
      }
      if (isActive !== "") filtered = filtered.filter((p) => p.isActive === (isActive === "true"));
      return paginate(filtered, page, pageSize);
    }
    const { data } = await api.get("/prebuilt", { params: { page, pageSize, search, isActive } });
    return data;
  },

  getById: async (id) => {
    if (useMock) {
      await delay(200);
      const item = MOCK_PREBUILT.find((p) => p.id === id);
      if (!item) throw new Error("Prebuilt PC not found");
      return item;
    }
    const { data } = await api.get(`/prebuilt/${id}`);
    return data;
  },

  create: async (data) => {
    if (useMock) {
      await delay(300);
      const newItem = { id: nextId++, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      MOCK_PREBUILT.push(newItem);
      return newItem;
    }
    const { data: res } = await api.post("/prebuilt", data);
    return res;
  },

  update: async (id, data) => {
    if (useMock) {
      await delay(300);
      const idx = MOCK_PREBUILT.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Prebuilt PC not found");
      MOCK_PREBUILT[idx] = { ...MOCK_PREBUILT[idx], ...data, updatedAt: new Date().toISOString() };
      return MOCK_PREBUILT[idx];
    }
    const { data: res } = await api.put(`/prebuilt/${id}`, data);
    return res;
  },

  delete: async (id) => {
    if (useMock) {
      await delay(200);
      const idx = MOCK_PREBUILT.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Prebuilt PC not found");
      MOCK_PREBUILT.splice(idx, 1);
      return { success: true };
    }
    const { data } = await api.delete(`/prebuilt/${id}`);
    return data;
  },
};
