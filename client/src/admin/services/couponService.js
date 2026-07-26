import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const toDatetimeLocal = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizeCoupon = (c) => ({
  ...c,
  id: c._id,
  _id: undefined,
  __v: undefined,
  type: c.discountType || c.type,
  value: c.discountValue ?? c.value,
  minOrder: c.minimumPurchase ?? c.minOrder ?? 0,
  maxUses: c.usageLimit ?? c.maxUses,
  startsAt: toDatetimeLocal(c.validFrom || c.startsAt),
  expiresAt: toDatetimeLocal(c.validUntil || c.expiresAt),
  discountType: undefined,
  discountValue: undefined,
  minimumPurchase: undefined,
  usageLimit: undefined,
  validFrom: undefined,
  validUntil: undefined,
});

const normalizeList = (res) => {
  const docs = res.coupons || res.docs || res.data || [];
  const items = Array.isArray(docs) ? docs.map(normalizeCoupon) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

const adaptParams = (params) => {
  const p = { ...params };
  p.discountType = p.type;
  delete p.type;
  Object.keys(p).forEach((k) => { if (p[k] === "" || p[k] === undefined) delete p[k]; });
  return p;
};

const adaptPayload = (data) => {
  const p = { ...data };
  if (p.type) { p.discountType = p.type; delete p.type; }
  if (p.value !== undefined) { p.discountValue = p.value; delete p.value; }
  if (p.minOrder !== undefined) { p.minimumPurchase = p.minOrder; delete p.minOrder; }
  if (p.maxUses !== undefined) { p.usageLimit = p.maxUses; delete p.maxUses; }
  if (p.startsAt) { p.validFrom = p.startsAt; delete p.startsAt; }
  if (p.expiresAt) { p.validUntil = p.expiresAt; delete p.expiresAt; }
  delete p.id;
  delete p._id;
  delete p.usedCount;
  return p;
};

export const couponService = {
  list: async ({ page = 0, pageSize = 10, search = "", isActive = "" } = {}) => {
    const params = adaptParams({ page, pageSize, search, isActive });
    const { data } = await api.get(ENDPOINTS.COUPON.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.COUPON.DETAILS(id));
    return normalizeCoupon(data.data);
  },

  create: async (couponData) => {
    const { data } = await api.post(ENDPOINTS.COUPON.CREATE, adaptPayload(couponData));
    return normalizeCoupon(data.data);
  },

  update: async (id, couponData) => {
    const { data } = await api.put(ENDPOINTS.COUPON.UPDATE(id), adaptPayload(couponData));
    return normalizeCoupon(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.COUPON.DELETE(id));
    return data;
  },
};
