import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";
import { toFormData } from "../../shared/utils/formDataHelper";

const normalizeBrand = (b) => ({
  ...b,
  id: b._id,
  _id: undefined,
  __v: undefined,
  productCount: b.productCount ?? 0,
});

const applyFilters = (items, { search, isActive }) => {
  let filtered = items;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((b) => b.name?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q));
  }
  if (isActive !== "") filtered = filtered.filter((b) => b.isActive === (isActive === "true"));
  return filtered;
};

const paginate = (items, page, pageSize) => {
  const start = page * pageSize;
  return { data: items.slice(start, start + pageSize), total: items.length };
};

export const brandService = {
  list: async ({ page = 0, pageSize = 10, search = "", isActive = "" } = {}) => {
    const { data } = await api.get(ENDPOINTS.BRAND.LIST);
    const items = (data.data || []).map(normalizeBrand);
    return paginate(applyFilters(items, { search, isActive }), page, pageSize);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.BRAND.DETAILS(id));
    return normalizeBrand(data.data);
  },

  create: async (brandData) => {
    const payload = { ...brandData };
    delete payload.id;
    delete payload._id;
    delete payload.productCount;
    delete payload.website;
    const fd = toFormData(payload, { logo: "logo" });
    const { data } = fd
      ? await api.post(ENDPOINTS.BRAND.CREATE, fd)
      : await api.post(ENDPOINTS.BRAND.CREATE, payload);
    return normalizeBrand(data.data);
  },

  update: async (id, brandData) => {
    const payload = { ...brandData };
    delete payload.id;
    delete payload._id;
    delete payload.productCount;
    delete payload.website;
    const fd = toFormData(payload, { logo: "logo" });
    const { data } = fd
      ? await api.put(ENDPOINTS.BRAND.UPDATE(id), fd)
      : await api.put(ENDPOINTS.BRAND.UPDATE(id), payload);
    return normalizeBrand(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.BRAND.DELETE(id));
    return data;
  },

  getAll: async () => {
    const { data } = await api.get(ENDPOINTS.BRAND.ALL);
    return (data.data || []).map(normalizeBrand);
  },
};
