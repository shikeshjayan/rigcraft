import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const COMPONENT_SLOTS = [
  { key: "processor", label: "Processor (CPU)", categoryType: "processor", required: true },
  { key: "graphics_card", label: "Graphics Card (GPU)", categoryType: "graphics_card", required: true },
  { key: "memory", label: "Memory (RAM)", categoryType: "memory", required: true },
  { key: "storage", label: "Storage", categoryType: "storage", required: true },
  { key: "motherboard", label: "Motherboard", categoryType: "motherboard", required: true },
  { key: "power_supply", label: "Power Supply (PSU)", categoryType: "power_supply", required: true },
  { key: "cooling", label: "Cooling", categoryType: "cooling", required: false },
  { key: "case", label: "Case", categoryType: "case", required: true },
];

export { COMPONENT_SLOTS };

const SLOT_TO_COMPONENT_TYPE = {
  processor: "cpu", graphics_card: "gpu", memory: "ram",
  storage: "storage", motherboard: "motherboard",
  power_supply: "psu", cooling: "cooler", case: "cabinet",
};

const COMPONENT_TYPE_TO_SLOT = Object.fromEntries(
  Object.entries(SLOT_TO_COMPONENT_TYPE).map(([k, v]) => [v, k])
);

const normalizePrebuilt = (p) => ({
  ...p,
  id: p._id,
  _id: undefined,
  __v: undefined,
  price: p.pricing?.price ?? p.price,
  comparePrice: p.pricing?.salePrice ?? p.comparePrice ?? null,
  isActive: p.status === "active",
  isFeatured: p.isFeatured ?? false,
  image: p.images?.[0]?.url || null,
  components: Array.isArray(p.components)
    ? Object.fromEntries(p.components.map((c) => [COMPONENT_TYPE_TO_SLOT[c.slot || c.type] || c.slot || c.type, c.component?.toString ? c.component.toString() : c.component]))
    : p.components || {},
  pricing: undefined,
  status: undefined,
  images: undefined,
});

const normalizeList = (res) => {
  const docs = res.docs || res.data || res.prebuiltPCs || [];
  const items = Array.isArray(docs) ? docs.map(normalizePrebuilt) : [];
  return {
    data: items,
    total: res.totalDocs ?? res.total ?? res.pagination?.total ?? items.length,
  };
};

const adaptParams = (params) => {
  const p = { ...params };
  if (p.isActive === "true") { p.status = "active"; delete p.isActive; }
  else if (p.isActive === "false") { p.status = "draft"; delete p.isActive; }
  else delete p.isActive;
  return p;
};

const adaptPayload = (data) => {
  const p = { ...data };
  if (p.isActive !== undefined) { p.status = p.isActive ? "active" : "draft"; delete p.isActive; }
  if (p.comparePrice !== undefined) {
    p.pricing = { price: p.price, salePrice: p.comparePrice || null };
    delete p.price;
    delete p.comparePrice;
  }
  if (p.components && typeof p.components === "object" && !Array.isArray(p.components)) {
    p.components = Object.entries(p.components)
      .filter(([, v]) => v)
      .map(([slot, productId]) => ({ type: SLOT_TO_COMPONENT_TYPE[slot] || slot, product: productId }));
  }
  if (p.image) {
    if (typeof p.image === "string") p.images = [{ url: p.image }];
    delete p.image;
  }
  delete p.id;
  delete p._id;
  return p;
};

const sendWithImage = async (endpoint, payload, imageFile, method = "post") => {
  const fd = new FormData();
  fd.append("images", imageFile);
  const body = { ...payload };
  delete body.images;
  fd.append("body", new Blob([JSON.stringify(body)], { type: "application/json" }));
  const fn = method === "put" ? api.put : api.post;
  const { data } = await fn(endpoint, fd);
  return data;
};

export const prebuiltService = {
  list: async ({ page = 0, pageSize = 10, search = "", isActive = "" } = {}) => {
    const params = adaptParams({ page, pageSize, search, isActive });
    const { data } = await api.get(ENDPOINTS.PREBUILT.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.PREBUILT.DETAILS(id));
    return normalizePrebuilt(data.data);
  },

  create: async (payload) => {
    const imageFile = payload.image instanceof File ? payload.image : null;
    const adapted = adaptPayload(payload);
    if (imageFile) {
      const res = await sendWithImage(ENDPOINTS.PREBUILT.CREATE, adapted, imageFile, "post");
      return normalizePrebuilt(res.data);
    }
    const { data } = await api.post(ENDPOINTS.PREBUILT.CREATE, adapted);
    return normalizePrebuilt(data.data);
  },

  update: async (id, payload) => {
    const imageFile = payload.image instanceof File ? payload.image : null;
    const adapted = adaptPayload(payload);
    if (imageFile) {
      const res = await sendWithImage(ENDPOINTS.PREBUILT.UPDATE(id), adapted, imageFile, "put");
      return normalizePrebuilt(res.data);
    }
    const { data } = await api.put(ENDPOINTS.PREBUILT.UPDATE(id), adapted);
    return normalizePrebuilt(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.PREBUILT.DELETE(id));
    return data;
  },
};
