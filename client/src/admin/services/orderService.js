import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalizeOrder = (o) => ({
  ...o,
  id: o._id,
  _id: undefined,
  __v: undefined,
  status: o.orderStatus || o.status,
  items: o.items?.length ?? o.items ?? 0,
  customer: o.user
    ? {
        name: o.user.name || `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim() || "Unknown",
        email: o.user.email,
        id: o.user._id,
      }
    : o.customer || { name: "Unknown", email: "" },
  shippingAddress: typeof o.shippingAddress === "object" && o.shippingAddress
    ? Object.values(o.shippingAddress).filter(Boolean).join(", ")
    : o.shippingAddress || "",
  orderStatus: undefined,
  user: undefined,
});

const normalizeList = (res) => {
  const docs = res.orders || res.docs || res.data || [];
  const items = Array.isArray(docs) ? docs.map(normalizeOrder) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

export const orderService = {
  list: async ({ page = 0, pageSize = 10, search = "", status = "" } = {}) => {
    const params = {
      page: page + 1,
      limit: pageSize,
      search,
      orderStatus: status || undefined,
    };
    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
    const { data } = await api.get(ENDPOINTS.ADMIN_ORDER.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ADMIN_ORDER.DETAILS(id));
    return normalizeOrder(data.data);
  },

  updateStatus: async (id, status) => {
    const { data } = await api.patch(ENDPOINTS.ADMIN_ORDER.UPDATE_STATUS(id), { orderStatus: status });
    return normalizeOrder(data.data);
  },
};
