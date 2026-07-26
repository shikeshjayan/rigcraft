import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalizeReview = (r) => ({
  ...r,
  id: r._id,
  _id: undefined,
  __v: undefined,
  status: r.isVisible ? "approved" : r.status === "hidden" ? "hidden" : "pending",
  product: r.item
    ? { id: r.item._id || r.item, name: r.item?.name || "" }
    : r.product || { id: "", name: "" },
  customer: r.user
    ? {
        id: r.user._id || r.user,
        name: r.user.name || `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() || "Unknown",
      }
    : r.customer || { name: "Unknown" },
  isVisible: undefined,
  item: undefined,
  itemModel: undefined,
  user: undefined,
});

const normalizeList = (res) => {
  const docs = res.docs || res.data || [];
  const items = Array.isArray(docs) ? docs.map(normalizeReview) : [];
  return {
    data: items,
    total: res.totalDocs ?? res.total ?? res.pagination?.total ?? items.length,
  };
};

export const reviewService = {
  list: async ({ page = 0, pageSize = 10, search = "", status = "", rating = "" } = {}) => {
    const params = {
      page: page + 1,
      limit: pageSize,
      search: search || undefined,
      status: status === "approved" ? "visible" : status === "pending" ? "hidden" : status || undefined,
      rating: rating || undefined,
    };
    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
    const { data } = await api.get(ENDPOINTS.ADMIN_REVIEW.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ADMIN_REVIEW.DETAILS(id));
    return normalizeReview(data.data);
  },

  updateStatus: async (id, status) => {
    const backendStatus = status === "approved" ? "visible" : status === "hidden" ? "hidden" : "hidden";
    const { data } = await api.patch(ENDPOINTS.ADMIN_REVIEW.UPDATE_STATUS(id), { status: backendStatus });
    return normalizeReview(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.ADMIN_REVIEW.DELETE(id));
    return data;
  },
};
