import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const HARDWARE_SLOTS = [
  { key: "processor", label: "Processor (CPU)", categoryType: "processor", required: true },
  { key: "graphics_card", label: "Graphics Card (GPU)", categoryType: "graphics_card", required: true },
  { key: "memory", label: "Memory (RAM)", categoryType: "memory", required: true },
  { key: "storage", label: "Storage", categoryType: "storage", required: false },
  { key: "motherboard", label: "Motherboard", categoryType: "motherboard", required: true },
  { key: "power_supply", label: "Power Supply (PSU)", categoryType: "power_supply", required: true },
  { key: "cooling", label: "Cooling", categoryType: "cooling", required: false },
  { key: "case", label: "Case", categoryType: "case", required: true },
];

const ADDON_SLOTS = [
  { key: "os", label: "Operating System", categoryType: "software", required: false },
  { key: "accessory", label: "Accessory", categoryType: "accessories", required: false },
];

const COMPONENT_SLOTS = [...HARDWARE_SLOTS, ...ADDON_SLOTS];
export { HARDWARE_SLOTS, ADDON_SLOTS, COMPONENT_SLOTS };

const SLOT_TO_COMPONENT_TYPE = {
  processor: "cpu", graphics_card: "gpu", memory: "ram",
  storage: "storage", motherboard: "motherboard",
  power_supply: "psu", cooling: "cooler", case: "cabinet",
  os: "operatingSystem", accessory: "accessory",
};

const COMPONENT_TYPE_TO_SLOT = Object.fromEntries(
  Object.entries(SLOT_TO_COMPONENT_TYPE).map(([k, v]) => [v, k])
);

const toLocalDatetime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const normalizePrebuilt = (p) => ({
  ...p,
  id: p._id,
  _id: undefined,
  __v: undefined,
  regularPrice: p.pricing?.price ?? p.price ?? p.regularPrice ?? 0,
  salePrice: p.pricing?.salePrice ?? p.salePrice ?? null,
  saleStart: toLocalDatetime(p.pricing?.saleStart ?? p.saleStart),
  saleEnd: toLocalDatetime(p.pricing?.saleEnd ?? p.saleEnd),
  isActive: p.status === "active",
  isFeatured: p.isFeatured ?? false,
  category: p.category || "",
  warrantyDuration: p.warranty?.duration ?? 0,
  warrantyUnit: p.warranty?.unit || "month",
  warrantyType: p.warranty?.type || "manufacturer",
  image: p.images?.[0]?.url || null,
  images: p.images || [],
  components: Array.isArray(p.components)
    ? Object.fromEntries(p.components.map((c) => {
        const key = COMPONENT_TYPE_TO_SLOT[c.slot || c.type] || c.slot || c.type;
        const val = c.product && typeof c.product === "object" && c.product._id
          ? c.product._id.toString()
          : typeof c.product === "string"
            ? c.product
            : c.product?.toString?.() || c.product;
        return [key, val];
      }))
    : p.components || {},
  pricing: undefined,
  status: undefined,
});

const normalizeList = (res) => {
  if (!res) return { data: [], total: 0 };
  let docs = [];
  if (Array.isArray(res)) {
    docs = res;
  } else if (Array.isArray(res.docs)) {
    docs = res.docs;
  } else if (Array.isArray(res.data)) {
    docs = res.data;
  } else if (Array.isArray(res.prebuiltPCs)) {
    docs = res.prebuiltPCs;
  }

  const items = docs.map(normalizePrebuilt);
  return {
    data: items,
    total: res.totalDocs ?? res.total ?? res.pagination?.total ?? items.length,
  };
};

const adaptParams = (params) => {
  const p = { ...params };
  p.page = (p.page || 0) + 1;
  p.limit = p.pageSize;
  delete p.pageSize;
  if (p.isActive === "true") { p.status = "active"; delete p.isActive; }
  else if (p.isActive === "false") { p.status = "draft"; delete p.isActive; }
  else delete p.isActive;
  return p;
};

const adaptPayload = (data) => {
  const p = { ...data };
  if (p.isActive !== undefined) { p.status = p.isActive ? "active" : "draft"; delete p.isActive; }
  if (!p.category) delete p.category;
  if (p.warrantyDuration !== undefined || p.warrantyUnit !== undefined || p.warrantyType !== undefined) {
    p.warranty = {
      duration: p.warrantyDuration ?? 0,
      unit: p.warrantyUnit || "month",
      type: p.warrantyType || "manufacturer",
    };
    delete p.warrantyDuration;
    delete p.warrantyUnit;
    delete p.warrantyType;
  }
  if (p.regularPrice !== undefined || p.salePrice !== undefined || p.saleStart !== undefined || p.saleEnd !== undefined) {
    p.pricing = { price: p.regularPrice };
    if (p.salePrice !== undefined) p.pricing.salePrice = p.salePrice;
    if (p.saleStart) p.pricing.saleStart = new Date(p.saleStart).toISOString();
    if (p.saleEnd) p.pricing.saleEnd = new Date(p.saleEnd).toISOString();
    delete p.price;
    delete p.regularPrice;
    delete p.salePrice;
    delete p.saleStart;
    delete p.saleEnd;
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
  fd.append("body", JSON.stringify(body));
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
