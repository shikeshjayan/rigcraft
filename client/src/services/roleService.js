import api from "../../shared/api/axios";

const normalizeRole = (r) => ({
  ...r,
  id: r._id,
  _id: undefined,
  __v: undefined,
});

const getAll = () =>
  api.get("/api/v1/roles").then((res) => res.data?.data || []);

const getByName = (name) =>
  api.get(`/api/v1/roles/${name}`).then((res) => normalizeRole(res.data?.data));

const create = (data) =>
  api.post("/api/v1/roles", data).then((res) => normalizeRole(res.data?.data));

const update = (name, data) =>
  api.put(`/api/v1/roles/${name}`, data).then((res) => normalizeRole(res.data?.data));

const deleteByName = (name) =>
  api.delete(`/api/v1/roles/${name}`).then((res) => res.data?.data);

export { getAll, getByName, create, update, deleteByName };