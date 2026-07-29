import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";
import { toFormData } from "../../shared/utils/formDataHelper";
import { SPEC_TEMPLATES } from "../constants/compatibilityFields";

const SPEC_LABEL_MAP = {};
Object.values(SPEC_TEMPLATES).forEach((templates) => {
  templates.forEach(({ key, label }) => {
    SPEC_LABEL_MAP[key] = label;
  });
});

const normalizeProduct = (p) => ({
  ...p,
  id: p._id,
  _id: undefined,
  _id: undefined,
  __v: undefined,
  brandId: p.brand?.toString ? p.brand.toString() : p.brand,
  categoryId: p.category?.toString ? p.category.toString() : p.category,
  categoryType: p.categoryType || p.productType,
  isActive: p.status === "active",
  regularPrice: p.price ?? p.regularPrice ?? 0,
  salePrice: p.salePrice ?? p.salePrice ?? null,
  saleStart: p.saleStart || "",
  saleEnd: p.saleEnd || "",
  length: p.dimensions?.length,
  width: p.dimensions?.width,
  height: p.dimensions?.height,
  warrantyDuration: p.warranty?.duration ?? 0,
  warrantyUnit: p.warranty?.unit || "month",
  warrantyType: p.warranty?.type || "manufacturer",
  specifications: p.specifications
    ? Object.entries(p.specifications).map(([key, value]) => ({ key, value, label: SPEC_LABEL_MAP[key] || "" }))
    : [],
  brand: undefined,
  category: undefined,
  dimensions: undefined,
  productType: undefined,
  status: undefined,
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
  if (p.categoryType) { p.productType = CATEGORY_TO_PRODUCT_TYPE[p.categoryType] || "component"; }
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
  if (p.categoryType) { p.productType = CATEGORY_TO_PRODUCT_TYPE[p.categoryType] || "component"; }
  if (p.brandId) { p.brand = p.brandId; delete p.brandId; }
  if (p.categoryId) { p.category = p.categoryId; delete p.categoryId; }
  if (p.salePrice !== undefined || p.salePrice === 0) { /* keep salePrice as-is */ }
  if (p.regularPrice !== undefined) { p.price = p.regularPrice; delete p.regularPrice; }
  if (p.length !== undefined || p.width !== undefined || p.height !== undefined) {
    p.dimensions = { length: p.length, width: p.width, height: p.height };
    delete p.length; delete p.width; delete p.height;
  }
  if (typeof p.tags === "string") {
    p.tags = p.tags.split(",").map(t => t.trim()).filter(Boolean);
  }
  if (Array.isArray(p.specifications)) {
    p.specifications = Object.fromEntries(
      p.specifications
        .filter((s) => s.key || s.label)
        .map((s) => [s.key || s.label.toLowerCase().replace(/\s+/g, "_"), s.value])
    );
  }
  if (Array.isArray(p.compatibility)) {
    p.compatibility = Object.fromEntries(
      p.compatibility.filter((c) => c.key).map((c) => [c.key, c.value])
    );
  }
  if (p.warrantyDuration !== undefined || p.warrantyUnit !== undefined || p.warrantyType !== undefined) {
    p.warranty = {
      duration: p.warrantyDuration ?? 0,
      unit: p.warrantyUnit || "month",
      type: p.warrantyType || "manufacturer",
    }
    delete p.warrantyDuration;
    delete p.warrantyUnit;
    delete p.warrantyType;
  }
  if (p.saleStart) p.saleStart = new Date(p.saleStart).toISOString();
  else delete p.saleStart;
  if (p.saleEnd) p.saleEnd = new Date(p.saleEnd).toISOString();
  else delete p.saleEnd;
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
