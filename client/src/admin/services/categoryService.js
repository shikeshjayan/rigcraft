import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";
import { toFormData } from "../../shared/utils/formDataHelper";

const normalizeCategory = (c) => ({
  ...c,
  id: c._id,
  _id: undefined,
  __v: undefined,
  parentId: c.parent?._id ? c.parent._id.toString() : (typeof c.parent === "string" ? c.parent : null),
  productCount: c.productCount ?? 0,
  parent: undefined,
});

const applyFilters = (items, { search, isActive }) => {
  let filtered = items;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((c) => c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q));
  }
  if (isActive !== "") filtered = filtered.filter((c) => c.isActive === (isActive === "true"));
  return filtered;
};

const paginate = (items, page, pageSize) => {
  const start = page * pageSize;
  return { data: items.slice(start, start + pageSize), total: items.length };
};

export const categoryService = {
  list: async ({ page = 0, pageSize = 10, search = "", isActive = "" } = {}) => {
    const { data } = await api.get(ENDPOINTS.CATEGORY.LIST);
    const items = (data.data || []).map(normalizeCategory);
    return paginate(applyFilters(items, { search, isActive }), page, pageSize);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.CATEGORY.DETAILS(id));
    return normalizeCategory(data.data);
  },

  create: async (categoryData) => {
    const payload = { ...categoryData };
    if ("parentId" in payload) { payload.parent = payload.parentId || null; delete payload.parentId; }
    delete payload.categoryType;
    delete payload.id;
    delete payload._id;
    delete payload.productCount;
    const fd = toFormData(payload, { image: "image" });
    const { data } = fd
      ? await api.post(ENDPOINTS.CATEGORY.CREATE, fd)
      : await api.post(ENDPOINTS.CATEGORY.CREATE, payload);
    return normalizeCategory(data.data);
  },

  update: async (id, categoryData) => {
    const payload = { ...categoryData };
    if ("parentId" in payload) { payload.parent = payload.parentId || null; delete payload.parentId; }
    delete payload.categoryType;
    delete payload.id;
    delete payload._id;
    delete payload.productCount;
    const fd = toFormData(payload, { image: "image" });
    const { data } = fd
      ? await api.put(ENDPOINTS.CATEGORY.UPDATE(id), fd)
      : await api.put(ENDPOINTS.CATEGORY.UPDATE(id), payload);
    return normalizeCategory(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.CATEGORY.DELETE(id));
    return data;
  },

  getAll: async () => {
    const { data } = await api.get(ENDPOINTS.CATEGORY.ALL);
    return (data.data || []).map(normalizeCategory);
  },
};
