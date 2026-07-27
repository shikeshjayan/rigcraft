import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const normalizeUser = (u) => ({
  ...u,
  id: u._id,
  _id: undefined,
  __v: undefined,
  name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown",
  status: u.isBlocked ? "inactive" : "active",
  isBlocked: undefined,
  firstName: undefined,
  lastName: undefined,
});

const normalizeList = (res) => {
  const docs = res.data || res.docs || res.users || [];
  const items = Array.isArray(docs) ? docs.map(normalizeUser) : [];
  return {
    data: items,
    total: res.pagination?.total ?? res.totalDocs ?? res.total ?? items.length,
  };
};

export const userService = {
  list: async ({ page = 0, pageSize = 10, search = "", role = "", status = "" } = {}) => {
    const params = { page: page + 1, limit: pageSize, search: search || undefined, role: role || undefined, status: status || undefined };
    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
    const { data } = await api.get(ENDPOINTS.USER.LIST, { params });
    return normalizeList(data.data);
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.USER.DETAILS(id));
    return normalizeUser(data.data);
  },

  update: async (id, userData) => {
    const payload = { ...userData };
    if (payload.name) {
      const parts = payload.name.split(" ");
      payload.firstName = parts[0] || "";
      payload.lastName = parts.slice(1).join(" ") || "";
      delete payload.name;
    }
    delete payload.id;
    delete payload._id;
    delete payload.role;
    delete payload.status;
    const { data } = await api.put(ENDPOINTS.USER.UPDATE(id), payload);
    return normalizeUser(data.data);
  },
};
