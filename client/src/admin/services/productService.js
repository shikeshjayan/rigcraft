import api from "./api";

const useMock = true;

const MOCK_PRODUCTS = [
  { id: 1, name: "Intel Core i9-14900K", slug: "intel-core-i9-14900k", sku: "CPU-INTEL-14900K", brandId: 3, categoryId: 1, categoryType: "processor", description: "24-core (8P+16E) desktop processor with turbo boost up to 6.0 GHz", shortDescription: "The fastest Intel processor for desktop", price: 589.99, comparePrice: 649.99, costPrice: 450, taxRate: 0, images: [], video: "", metaTitle: "", metaDescription: "", stock: 50, trackInventory: true, lowStockThreshold: 10, weight: 0.1, length: 0, width: 0, height: 0, isActive: true, isFeatured: true, specifications: [{ key: "core_count", value: "24 (8P + 16E)", label: "Core Count" }, { key: "base_clock", value: "3.2 GHz", label: "Base Clock" }, { key: "boost_clock", value: "6.0 GHz", label: "Boost Clock" }, { key: "socket", value: "LGA1700", label: "Socket" }, { key: "tdp", value: "125W", label: "TDP" }], compatibility: { socket: "LGA1700" }, relatedProductIds: [2, 3], tags: ["intel", "core i9", "flagship"], createdAt: "2025-01-20T10:00:00Z", updatedAt: "2025-06-20T08:00:00Z" },
  { id: 2, name: "AMD Ryzen 9 7950X", slug: "amd-ryzen-9-7950x", sku: "CPU-AMD-7950X", brandId: 2, categoryId: 1, categoryType: "processor", description: "16-core 32-thread desktop processor with boost up to 5.7 GHz", shortDescription: "AMD's flagship consumer processor", price: 549.99, comparePrice: 599.99, costPrice: 420, taxRate: 0, images: [], video: "", metaTitle: "", metaDescription: "", stock: 35, trackInventory: true, lowStockThreshold: 10, weight: 0.1, length: 0, width: 0, height: 0, isActive: true, isFeatured: false, specifications: [{ key: "core_count", value: "16", label: "Core Count" }, { key: "base_clock", value: "4.5 GHz", label: "Base Clock" }, { key: "boost_clock", value: "5.7 GHz", label: "Boost Clock" }, { key: "socket", value: "AM5", label: "Socket" }, { key: "tdp", value: "170W", label: "TDP" }], compatibility: { socket: "AM5" }, relatedProductIds: [1], tags: ["amd", "ryzen 9", "flagship"], createdAt: "2025-01-20T10:00:00Z", updatedAt: "2025-06-19T09:00:00Z" },
  { id: 3, name: "NVIDIA GeForce RTX 4090", slug: "nvidia-rtx-4090", sku: "GPU-NVIDIA-4090", brandId: 1, categoryId: 2, categoryType: "graphics_card", description: "24GB GDDR6X flagship graphics card", shortDescription: "The ultimate graphics card for gaming and creation", price: 1799.99, comparePrice: null, costPrice: 1400, taxRate: 0, images: [], video: "", metaTitle: "", metaDescription: "", stock: 15, trackInventory: true, lowStockThreshold: 5, weight: 2.1, length: 336, width: 140, height: 61, isActive: true, isFeatured: true, specifications: [{ key: "vram", value: "24 GB", label: "VRAM" }, { key: "vram_type", value: "GDDR6X", label: "VRAM Type" }, { key: "boost_clock", value: "2.52 GHz", label: "Boost Clock" }, { key: "tdp", value: "450W", label: "TDP" }], compatibility: { pcie_version: "PCIe 4.0" }, relatedProductIds: [], tags: ["nvidia", "rtx 4090", "flagship"], createdAt: "2025-01-20T10:00:00Z", updatedAt: "2025-06-18T10:00:00Z" },
  { id: 4, name: "Corsair Vengeance DDR5 32GB", slug: "corsair-vengeance-ddr5-32gb", sku: "RAM-COR-32GB-D5", brandId: 4, categoryId: 3, categoryType: "memory", description: "32GB (2x16GB) DDR5-5600MHz CL36 memory kit", shortDescription: "High-performance DDR5 memory for gaming", price: 109.99, comparePrice: 129.99, costPrice: 80, taxRate: 0, images: [], video: "", metaTitle: "", metaDescription: "", stock: 200, trackInventory: true, lowStockThreshold: 20, weight: 0.15, length: 0, width: 0, height: 0, isActive: true, isFeatured: false, specifications: [{ key: "capacity", value: "32 GB (2x16GB)", label: "Capacity" }, { key: "speed", value: "5600 MHz", label: "Speed" }, { key: "memory_type", value: "DDR5", label: "Memory Type" }, { key: "cas_latency", value: "CL36", label: "CAS Latency" }], compatibility: { memory_type: "DDR5", form_factor: "DIMM" }, relatedProductIds: [], tags: ["corsair", "ddr5", "memory"], createdAt: "2025-01-25T10:00:00Z", updatedAt: "2025-06-17T11:00:00Z" },
  { id: 5, name: "Samsung 990 Pro 2TB", slug: "samsung-990-pro-2tb", sku: "SSD-SAM-2TB-990", brandId: 8, categoryId: 5, categoryType: "storage", description: "2TB NVMe M.2 PCIe 4.0 SSD with read speeds up to 7,450 MB/s", shortDescription: "Blazing fast NVMe storage", price: 189.99, comparePrice: 219.99, costPrice: 140, taxRate: 0, images: [], video: "", metaTitle: "", metaDescription: "", stock: 85, trackInventory: true, lowStockThreshold: 15, weight: 0.05, length: 0, width: 0, height: 0, isActive: true, isFeatured: true, specifications: [{ key: "capacity", value: "2 TB", label: "Capacity" }, { key: "storage_type", value: "NVMe SSD", label: "Storage Type" }, { key: "interface", value: "NVMe PCIe 4.0", label: "Interface" }, { key: "read_speed", value: "7,450 MB/s", label: "Read Speed" }, { key: "write_speed", value: "6,900 MB/s", label: "Write Speed" }], compatibility: {}, relatedProductIds: [], tags: ["samsung", "nvme", "ssd"], createdAt: "2025-02-01T10:00:00Z", updatedAt: "2025-06-16T14:00:00Z" },
];

let nextId = 6;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const paginate = (data, page, pageSize) => {
  const start = page * pageSize;
  return { data: data.slice(start, start + pageSize), total: data.length };
};

export const productService = {
  list: async ({ page = 0, pageSize = 10, search = "", categoryType = "", brandId = "", isActive = "", isFeatured = "" } = {}) => {
    if (useMock) {
      await delay(400);
      let filtered = [...MOCK_PRODUCTS];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
      }
      if (categoryType) filtered = filtered.filter((p) => p.categoryType === categoryType);
      if (brandId) filtered = filtered.filter((p) => p.brandId === Number(brandId));
      if (isActive !== "") filtered = filtered.filter((p) => p.isActive === (isActive === "true"));
      if (isFeatured !== "") filtered = filtered.filter((p) => p.isFeatured === (isFeatured === "true"));
      return paginate(filtered, page, pageSize);
    }
    const { data } = await api.get("/products", { params: { page, pageSize, search, categoryType, brandId, isActive, isFeatured } });
    return data;
  },

  getById: async (id) => {
    if (useMock) {
      await delay(200);
      const product = MOCK_PRODUCTS.find((p) => p.id === id);
      if (!product) throw new Error("Product not found");
      return { ...product, brandId: String(product.brandId), categoryId: String(product.categoryId) };
    }
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (productData) => {
    if (useMock) {
      await delay(400);
      const newProduct = { id: nextId++, ...productData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      MOCK_PRODUCTS.push(newProduct);
      return newProduct;
    }
    const { data } = await api.post("/products", productData);
    return data;
  },

  update: async (id, productData) => {
    if (useMock) {
      await delay(400);
      const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Product not found");
      MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...productData, updatedAt: new Date().toISOString() };
      return MOCK_PRODUCTS[idx];
    }
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },

  delete: async (id) => {
    if (useMock) {
      await delay(200);
      const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Product not found");
      MOCK_PRODUCTS.splice(idx, 1);
      return { success: true };
    }
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};
