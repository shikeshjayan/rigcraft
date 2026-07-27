import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";
import { toFormData } from "../../shared/utils/formDataHelper";

const normalizeProduct = (p) => ({
  ...p,
  id: p._id,
  _id: undefined,
  __v: undefined,
  brandId: p.brand?.toString ? p.brand.toString() : p.brand,
  categoryId: p.category?.toString ? p.category.toString() : p.category,
  categoryType: p.productType || p.categoryType,
  isActive: p.status === "active",
  comparePrice: p.salePrice ?? p.comparePrice ?? null,
  length: p.dimensions?.length,
  width: p.dimensions?.width,
  height: p.dimensions?.height,
  specifications: p.specifications
    ? Object.entries(p.specifications).map(([key, value]) => ({ key, value, label: "" }))
    : [],
  brand: undefined,
  category: undefined,
  dimensions: undefined,
  productType: undefined,
  status: undefined,
  salePrice: undefined,
});

const normalizeList = (res) => {
  const docs = res.docs || res.data || res.products || res;
  const items = Array.isArray(docs) ? docs.map(normalizeProduct) : [];
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
  if (p.categoryType) { p.productType = CATEGORY_TO_PRODUCT_TYPE[p.categoryType] || "component"; delete p.categoryType; }
  if (p.brandId) { p.brand = p.brandId; delete p.brandId; }
  if (p.isActive === "true") { p.status = "active"; delete p.isActive; }
  else if (p.isActive === "false") { p.status = "draft"; delete p.isActive; }
  else delete p.isActive;
  return p;
};

const CATEGORY_TO_PRODUCT_TYPE = {
  processor: "component", graphics_card: "component", memory: "component",
  motherboard: "component", storage: "component", power_supply: "component",
  case: "component", cooling: "component",
  prebuilt_pc: "prebuilt",
  accessories: "accessory", software: "accessory", networking: "accessory",
};

const adaptPayload = (data) => {
  const p = { ...data };
  if (p.isActive !== undefined) { p.status = p.isActive ? "active" : "draft"; delete p.isActive; }
  if (p.categoryType) { p.productType = CATEGORY_TO_PRODUCT_TYPE[p.categoryType] || "component"; delete p.categoryType; }
  if (p.brandId) { p.brand = p.brandId; delete p.brandId; }
  if (p.categoryId) { p.category = p.categoryId; delete p.categoryId; }
  if (p.comparePrice !== undefined) { if (p.comparePrice) p.salePrice = p.comparePrice; delete p.comparePrice; }
  if (p.length !== undefined || p.width !== undefined || p.height !== undefined) {
    p.dimensions = { length: p.length, width: p.width, height: p.height };
    delete p.length; delete p.width; delete p.height;
  }
  if (Array.isArray(p.specifications)) {
    p.specifications = Object.fromEntries(
      p.specifications.filter((s) => s.key).map((s) => [s.key, s.value])
    );
  }
  delete p.id;
  delete p._id;
  return p;
};

export const PRODUCT_TYPE_DISPLAY = {
  component: { label: "Component", color: "#2563eb" },
  prebuilt: { label: "Prebuilt PC", color: "#9333ea" },
  accessory: { label: "Accessory", color: "#ca8a04" },
};

export const productService = {
  list: async ({ page = 0, pageSize = 10, search = "", categoryType = "", brandId = "", isActive = "", isFeatured = "" } = {}) => {
    const params = adaptParams({ page, pageSize, search, categoryType, brandId, isActive, isFeatured });
    const { data } = await api.get(ENDPOINTS.PRODUCT.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.PRODUCT.DETAILS(id));
    return normalizeProduct(data.data);
  },

  create: async (productData) => {
    const payload = adaptPayload(productData);
    const fd = toFormData(payload, { images: "images" });
    const { data } = fd
      ? await api.post(ENDPOINTS.PRODUCT.CREATE, fd)
      : await api.post(ENDPOINTS.PRODUCT.CREATE, payload);
    return normalizeProduct(data.data);
  },

  update: async (id, productData) => {
    const payload = adaptPayload(productData);
    const fd = toFormData(payload, { images: "images" });
    const { data } = fd
      ? await api.put(ENDPOINTS.PRODUCT.UPDATE(id), fd)
      : await api.put(ENDPOINTS.PRODUCT.UPDATE(id), payload);
    return normalizeProduct(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.PRODUCT.DELETE(id));
    return data;
  },
};
