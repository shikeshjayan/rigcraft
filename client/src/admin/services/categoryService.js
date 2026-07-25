import api from "./api";

const useMock = true;

const MOCK_CATEGORIES = [
  { id: 1, name: "Processors", slug: "processors", description: "CPUs from Intel and AMD", image: null, parentId: null, categoryType: "processor", isActive: true, order: 1, productCount: 24, createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-06-20T08:30:00Z" },
  { id: 2, name: "Graphics Cards", slug: "graphics-cards", description: "GPUs from NVIDIA and AMD", image: null, parentId: null, categoryType: "graphics_card", isActive: true, order: 2, productCount: 18, createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-06-19T14:00:00Z" },
  { id: 3, name: "RAM Modules", slug: "ram-modules", description: "DDR4 and DDR5 memory", image: null, parentId: null, categoryType: "memory", isActive: true, order: 3, productCount: 32, createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-06-18T09:15:00Z" },
  { id: 4, name: "Motherboards", slug: "motherboards", description: "Motherboards for all sockets", image: null, parentId: null, categoryType: "motherboard", isActive: true, order: 4, productCount: 15, createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-06-17T11:45:00Z" },
  { id: 5, name: "Storage", slug: "storage", description: "SSDs, HDDs, and NVMe drives", image: null, parentId: null, categoryType: "storage", isActive: true, order: 5, productCount: 28, createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-06-16T16:30:00Z" },
  { id: 6, name: "Intel CPUs", slug: "intel-cpus", description: "Intel Core processors", image: null, parentId: 1, categoryType: "processor", isActive: true, order: 1, productCount: 12, createdAt: "2025-02-01T10:00:00Z", updatedAt: "2025-06-15T08:00:00Z" },
  { id: 7, name: "AMD CPUs", slug: "amd-cpus", description: "AMD Ryzen processors", image: null, parentId: 1, categoryType: "processor", isActive: true, order: 2, productCount: 10, createdAt: "2025-02-01T10:00:00Z", updatedAt: "2025-06-14T09:30:00Z" },
  { id: 8, name: "NVIDIA GPUs", slug: "nvidia-gpus", description: "NVIDIA GeForce graphics cards", image: null, parentId: 2, categoryType: "graphics_card", isActive: true, order: 1, productCount: 10, createdAt: "2025-02-01T10:00:00Z", updatedAt: "2025-06-13T12:00:00Z" },
  { id: 9, name: "Power Supplies", slug: "power-supplies", description: "PSUs from leading brands", image: null, parentId: null, categoryType: "power_supply", isActive: true, order: 6, productCount: 20, createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-06-12T10:45:00Z" },
  { id: 10, name: "CPU Coolers", slug: "cpu-coolers", description: "Air and liquid cooling solutions", image: null, parentId: null, categoryType: "cooling", isActive: false, order: 7, productCount: 0, createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-06-11T15:20:00Z" },
];

let nextId = 11;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const paginate = (data, page, pageSize) => {
  const start = page * pageSize;
  return {
    data: data.slice(start, start + pageSize),
    total: data.length,
  };
};

export const categoryService = {
  list: async ({ page = 0, pageSize = 10, search = "", categoryType = "", isActive = "" } = {}) => {
    if (useMock) {
      await delay(300);
      let filtered = [...MOCK_CATEGORIES];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
      }
      if (categoryType) filtered = filtered.filter((c) => c.categoryType === categoryType);
      if (isActive !== "") filtered = filtered.filter((c) => c.isActive === (isActive === "true"));
      return paginate(filtered, page, pageSize);
    }
    const { data } = await api.get("/categories", { params: { page, pageSize, search, categoryType, isActive } });
    return data;
  },

  getById: async (id) => {
    if (useMock) {
      await delay(200);
      const category = MOCK_CATEGORIES.find((c) => c.id === id);
      if (!category) throw new Error("Category not found");
      return category;
    }
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  create: async (categoryData) => {
    if (useMock) {
      await delay(300);
      const newCategory = { id: nextId++, ...categoryData, productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      MOCK_CATEGORIES.push(newCategory);
      return newCategory;
    }
    const { data } = await api.post("/categories", categoryData);
    return data;
  },

  update: async (id, categoryData) => {
    if (useMock) {
      await delay(300);
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Category not found");
      MOCK_CATEGORIES[idx] = { ...MOCK_CATEGORIES[idx], ...categoryData, updatedAt: new Date().toISOString() };
      return MOCK_CATEGORIES[idx];
    }
    const { data } = await api.put(`/categories/${id}`, categoryData);
    return data;
  },

  delete: async (id) => {
    if (useMock) {
      await delay(200);
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Category not found");
      MOCK_CATEGORIES.splice(idx, 1);
      return { success: true };
    }
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },

  getAll: async () => {
    if (useMock) {
      await delay(200);
      return [...MOCK_CATEGORIES];
    }
    const { data } = await api.get("/categories/all");
    return data;
  },
};
