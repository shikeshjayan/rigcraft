import * as roleService from '../services/role.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const list = asyncHandler(async (req, res) => {
  const roles = await roleService.getAllRoles();
  ApiResponse.ok(roles, 'Roles fetched successfully').send(res);
});

export const getByName = asyncHandler(async (req, res) => {
  const role = await roleService.getRole(req.params.name);
  ApiResponse.ok(role, 'Role fetched successfully').send(res);
});

export const create = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);
  ApiResponse.created(role, 'Role created successfully').send(res);
});

export const update = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.name, req.body);
  ApiResponse.ok(role, 'Role updated successfully').send(res);
});

export const remove = asyncHandler(async (req, res) => {
  const result = await roleService.deleteRole(req.params.name);
  ApiResponse.ok(result, 'Role deleted successfully').send(res);
});
