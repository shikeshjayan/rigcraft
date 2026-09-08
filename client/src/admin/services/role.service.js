import { roleService as api } from "../../services/roleService";

const getAllRoles = () => api.getAll();
const getRole = (name) => api.getByName(name);
const updateRole = (name, data) => api.update(name, data);
const createRole = (data) => api.create(data);
const deleteRole = (name) => api.deleteByName(name);

export { getAllRoles, getRole, updateRole, createRole, deleteRole };