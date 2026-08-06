import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";
import { toFormData } from "../../shared/utils/formDataHelper";

const toDatetimeLocal = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizeBundle = (b) => ({
  ...b,
  id: b._id,
  _id: undefined,
  __v: undefined,
  products: (b.products || []).map((p) => p._id || p.id || p),
  prebuiltPcs: (b.prebuiltPCs || []).map((p) => p._id || p.id || p),
  startsAt: toDatetimeLocal(b.startDate),
  endsAt: toDatetimeLocal(b.endDate),
  prebuiltPCs: undefined,
  startDate: undefined,
  endDate: undefined,
});

const normalizeList = (res) => {
  const docs = res.bundles || res.docs || res.data || [];
  const items = Array.isArray(docs) ? docs.map(normalizeBundle) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

const adaptParams = (params) => {
  const p = { ...params };
  p.page = (p.page || 0) + 1;
  p.limit = p.pageSize;
  delete p.pageSize;
  Object.keys(p).forEach((k) => {
    if (p[k] === "" || p[k] === undefined) delete p[k];
  });
  return p;
};

const adaptPayload = (data) => {
  const p = { ...data };
  p.prebuiltPCs = p.prebuiltPcs || [];
  delete p.prebuiltPcs;
  if (p.startsAt) {
    p.startDate = new Date(p.startsAt).toISOString();
    delete p.startsAt;
  }
  if (p.endsAt) {
    p.endDate = new Date(p.endsAt).toISOString();
    delete p.endsAt;
  }
  delete p.id;
  delete p._id;
  delete p.itemsTotal;
  delete p.savings;
  delete p.discountPct;
  return p;
};

export const bundleService = {
  list: async ({ page = 0, pageSize = 10, search = "", isActive = "" } = {}) => {
    const params = adaptParams({ page, pageSize, search, isActive });
    const { data } = await api.get(ENDPOINTS.ADMIN_BUNDLE.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ADMIN_BUNDLE.DETAILS(id));
    return normalizeBundle(data.data);
  },

  create: async (bundleData) => {
    const payload = adaptPayload(bundleData);
    const fd = toFormData(payload, { image: "image" });
    const { data } = fd
      ? await api.post(ENDPOINTS.ADMIN_BUNDLE.CREATE, fd)
      : await api.post(ENDPOINTS.ADMIN_BUNDLE.CREATE, payload);
    return normalizeBundle(data.data);
  },

  update: async (id, bundleData) => {
    const payload = adaptPayload(bundleData);
    const fd = toFormData(payload, { image: "image" });
    const { data } = fd
      ? await api.put(ENDPOINTS.ADMIN_BUNDLE.UPDATE(id), fd)
      : await api.put(ENDPOINTS.ADMIN_BUNDLE.UPDATE(id), payload);
    return normalizeBundle(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.ADMIN_BUNDLE.DELETE(id));
    return data;
  },

  toggleStatus: async (id) => {
    const { data } = await api.patch(ENDPOINTS.ADMIN_BUNDLE.TOGGLE_STATUS(id));
    return data.data;
  },
};
