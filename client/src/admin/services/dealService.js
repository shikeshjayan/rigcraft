import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalizeDeal = (d) => ({
  ...d,
  id: d._id,
  _id: undefined,
  __v: undefined,
});

const normalizeList = (res) => {
  const docs = res.data || res.docs || res.deals || [];
  const items = Array.isArray(docs) ? docs.map(normalizeDeal) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

const extractFile = (banner) => {
  if (!banner || typeof banner !== "object") return null;
  return banner.file instanceof File ? banner.file : null;
};

const sendWithImages = async (endpoint, payload, method) => {
  const body = { ...payload };

  const desktopFile = extractFile(body.desktopBanner);
  const mobileFile = extractFile(body.mobileBanner);

  if (desktopFile) delete body.desktopBanner;
  if (mobileFile) delete body.mobileBanner;

  const fd = new FormData();
  if (desktopFile) fd.append("desktopBanner", desktopFile);
  if (mobileFile) fd.append("mobileBanner", mobileFile);
  fd.append("body", JSON.stringify(body));

  const fn = method === "put" ? api.put : api.post;
  const { data } = await fn(endpoint, fd);
  return data;
};

export const dealService = {
  list: async ({ page = 0, pageSize = 10, search = "", status = "" } = {}) => {
    const params = { page: page + 1, limit: pageSize };
    if (search) params.search = search.trim();
    if (status === "active") params.isActive = "true";
    if (status === "expired" || status === "scheduled") params.isActive = "false";
    const { data } = await api.get(ENDPOINTS.ADMIN_DEAL.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.ADMIN_DEAL.DETAILS(id));
    return normalizeDeal(data.data);
  },

  uploadImage: async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await api.post(ENDPOINTS.UPLOAD.IMAGE, fd);
    return data?.data ?? data;
  },

  create: async (dealData) => {
    const payload = { ...dealData };
    delete payload.id;
    delete payload._id;
    const hasFiles = extractFile(payload.desktopBanner) || extractFile(payload.mobileBanner);
    const res = hasFiles
      ? await sendWithImages(ENDPOINTS.ADMIN_DEAL.CREATE, payload, "post")
      : await api.post(ENDPOINTS.ADMIN_DEAL.CREATE, payload);
    return normalizeDeal(res.data);
  },

  update: async (id, dealData) => {
    const payload = { ...dealData };
    delete payload.id;
    delete payload._id;
    const hasFiles = extractFile(payload.desktopBanner) || extractFile(payload.mobileBanner);
    const res = hasFiles
      ? await sendWithImages(ENDPOINTS.ADMIN_DEAL.UPDATE(id), payload, "put")
      : await api.put(ENDPOINTS.ADMIN_DEAL.UPDATE(id), payload);
    return normalizeDeal(res.data);
  },

  toggleStatus: async (id) => {
    const { data } = await api.patch(ENDPOINTS.ADMIN_DEAL.TOGGLE_STATUS(id));
    return normalizeDeal(data.data);
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.ADMIN_DEAL.DELETE(id));
    return data;
  },
};
