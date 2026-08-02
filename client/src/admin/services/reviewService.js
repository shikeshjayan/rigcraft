import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalizeReview = (r) => ({
  ...r,
  id: r._id,
  _id: undefined,
  __v: undefined,
  status: r.status || "pending",
  type: r.reviewType || "product",
  reviewType: undefined,
  product:
    r.reviewType === "website"
      ? null
      : r.item
        ? {
            id: r.item._id || r.item,
            name: r.item?.name || r.item?.title || "Unknown Product",
            image: r.item?.images?.find((i) => i.isPrimary)?.url || r.item?.images?.[0]?.url,
          }
        : r.product || { id: "", name: "Unknown Product" },
  customer: r.user
    ? {
        id: r.user._id || r.user,
        name: r.user.name || `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() || "Unknown",
      }
    : r.customer || { name: "Unknown" },
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
  list: async ({ page = 0, pageSize = 10, search = "", status = "", rating = "", reviewType = "", featured = "", reported = "", spamFlagged = "" } = {}) => {
    const params = {
      page: page + 1,
      limit: pageSize,
      search: search || undefined,
      status: status || undefined,
      rating: rating || undefined,
      reviewType: reviewType || undefined,
      featured: featured || undefined,
      reported: reported || undefined,
      spamFlagged: spamFlagged || undefined,
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
    const { data } = await api.patch(ENDPOINTS.ADMIN_REVIEW.UPDATE_STATUS(id), { status });
    return normalizeReview(data.data);
  },

  toggleFeatured: async (id, { featured, displayOrder }) => {
    const { data } = await api.patch(ENDPOINTS.ADMIN_REVIEW.FEATURE(id), { featured, displayOrder });
    return normalizeReview(data.data);
  },

  reply: async (id, text) => {
    const { data } = await api.patch(ENDPOINTS.ADMIN_REVIEW.REPLY(id), { text });
    return normalizeReview(data.data);
  },

  dismissReports: async (id) => {
    const { data } = await api.patch(ENDPOINTS.ADMIN_REVIEW.DISMISS_REPORTS(id));
    return normalizeReview(data.data);
  },

  clearSpam: async (id) => {
    const { data } = await api.patch(ENDPOINTS.ADMIN_REVIEW.CLEAR_SPAM(id));
    return normalizeReview(data.data);
  },

  stats: async () => {
    const { data } = await api.get(ENDPOINTS.ADMIN_REVIEW.STATS);
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.ADMIN_REVIEW.DELETE(id));
    return data;
  },
};
