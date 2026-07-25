import api from "./api";

const useMock = true;

const MOCK_BRANDS = [
  { id: 1, name: "NVIDIA", slug: "nvidia", logo: null, description: "Leading GPU manufacturer", website: "https://nvidia.com", isActive: true, productCount: 45, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-20T08:00:00Z" },
  { id: 2, name: "AMD", slug: "amd", logo: null, description: "CPUs and GPUs", website: "https://amd.com", isActive: true, productCount: 38, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-19T09:00:00Z" },
  { id: 3, name: "Intel", slug: "intel", logo: null, description: "Processor manufacturer", website: "https://intel.com", isActive: true, productCount: 52, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-18T10:30:00Z" },
  { id: 4, name: "Corsair", slug: "corsair", logo: null, description: "RAM, PSUs, and peripherals", website: "https://corsair.com", isActive: true, productCount: 67, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-17T11:15:00Z" },
  { id: 5, name: "ASUS", slug: "asus", logo: null, description: "Motherboards and GPUs", website: "https://asus.com", isActive: true, productCount: 73, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-16T14:00:00Z" },
  { id: 6, name: "MSI", slug: "msi", logo: null, description: "Motherboards and GPUs", website: "https://msi.com", isActive: true, productCount: 41, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-15T15:45:00Z" },
  { id: 7, name: "Gigabyte", slug: "gigabyte", logo: null, description: "Motherboards and GPUs", website: "https://gigabyte.com", isActive: true, productCount: 36, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-14T08:30:00Z" },
  { id: 8, name: "Samsung", slug: "samsung", logo: null, description: "Storage and memory", website: "https://samsung.com", isActive: true, productCount: 29, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-13T09:00:00Z" },
  { id: 9, name: "Western Digital", slug: "western-digital", logo: null, description: "Storage solutions", website: "https://westerndigital.com", isActive: false, productCount: 0, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-12T10:15:00Z" },
  { id: 10, name: "Noctua", slug: "noctua", logo: null, description: "Premium cooling solutions", website: "https://noctua.at", isActive: true, productCount: 18, createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-06-11T12:00:00Z" },
];

let nextId = 11;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const paginate = (data, page, pageSize) => {
  const start = page * pageSize;
  return { data: data.slice(start, start + pageSize), total: data.length };
};

export const brandService = {
  list: async ({ page = 0, pageSize = 10, search = "", isActive = "" } = {}) => {
    if (useMock) {
      await delay(300);
      let filtered = [...MOCK_BRANDS];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q));
      }
      if (isActive !== "") filtered = filtered.filter((b) => b.isActive === (isActive === "true"));
      return paginate(filtered, page, pageSize);
    }
    const { data } = await api.get("/brands", { params: { page, pageSize, search, isActive } });
    return data;
  },

  getById: async (id) => {
    if (useMock) {
      await delay(200);
      const brand = MOCK_BRANDS.find((b) => b.id === id);
      if (!brand) throw new Error("Brand not found");
      return brand;
    }
    const { data } = await api.get(`/brands/${id}`);
    return data;
  },

  create: async (brandData) => {
    if (useMock) {
      await delay(300);
      const newBrand = { id: nextId++, ...brandData, productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      MOCK_BRANDS.push(newBrand);
      return newBrand;
    }
    const { data } = await api.post("/brands", brandData);
    return data;
  },

  update: async (id, brandData) => {
    if (useMock) {
      await delay(300);
      const idx = MOCK_BRANDS.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error("Brand not found");
      MOCK_BRANDS[idx] = { ...MOCK_BRANDS[idx], ...brandData, updatedAt: new Date().toISOString() };
      return MOCK_BRANDS[idx];
    }
    const { data } = await api.put(`/brands/${id}`, brandData);
    return data;
  },

  delete: async (id) => {
    if (useMock) {
      await delay(200);
      const idx = MOCK_BRANDS.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error("Brand not found");
      MOCK_BRANDS.splice(idx, 1);
      return { success: true };
    }
    const { data } = await api.delete(`/brands/${id}`);
    return data;
  },

  getAll: async () => {
    if (useMock) {
      await delay(200);
      return [...MOCK_BRANDS];
    }
    const { data } = await api.get("/brands/all");
    return data;
  },
};
