import roleRepository from '../repositories/role.repository.js';
import { ROLE_PERMISSIONS } from '../constants/role-permissions.js';
import { USER_ROLES } from '../constants/constants.js';
import ApiError from '../utils/ApiError.js';

let roleCache = null;
let cacheReady = false;
let cacheTimestamp = 0;

export const loadCacheFromDB = async () => {
  try {
    const roles = await roleRepository.findAllActive();
    roleCache = new Map();
    for (const role of roles) {
      roleCache.set(role.name, role.permissions || []);
    }
    cacheReady = true;
    cacheTimestamp = Date.now();
  } catch (err) {
    rollBackToStatic();
  }
};

const rollBackToStatic = () => {
  roleCache = new Map();
  for (const [key, value] of Object.entries(ROLE_PERMISSIONS)) {
    if (key === 'customer') {
      roleCache.set('customer', value);
    } else if (key === 'admin') {
      roleCache.set('admin', value);
    } else if (key === 'super_admin') {
      roleCache.set('super_admin', value);
    } else if (key === 'product_manager') {
      roleCache.set('product_manager', value);
    } else if (key === 'order_manager') {
      roleCache.set('order_manager', value);
    } else if (key === 'support_executive') {
      roleCache.set('support_executive', value);
    }
  }
  cacheReady = true;
};

export const getPermissions = async (roleName) => {
  if (!cacheReady) {
    await loadCacheFromDB();
  }
  const key = roleName?.toString()?.toLowerCase();
  if (roleCache && roleCache.has(key)) {
    return roleCache.get(key);
  }
  const staticPerms = ROLE_PERMISSIONS[key];
  if (staticPerms) return staticPerms;
  return null;
};

export const invalidateCache = () => {
  cacheReady = false;
  roleCache = null;
  cacheTimestamp = 0;
};

export const getAllRoles = async () => {
  if (!cacheReady) await loadCacheFromDB();
  const roles = await roleRepository.findAllActive();
  return roles.map((r) => r.toSafeObject ? r.toSafeObject() : {
    name: r.name,
    label: r.label,
    isSystem: r.isSystem,
    isActive: r.isActive,
    permissions: r.permissions,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
};

export const getRole = async (name) => {
  const role = await roleRepository.findByName(name);
  if (!role) throw ApiError.notFound('Role not found');
  return role.toSafeObject ? role.toSafeObject() : {
    name: role.name,
    label: role.label,
    isSystem: role.isSystem,
    isActive: role.isActive,
    permissions: role.permissions,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};

export const createRole = async (data) => {
  if (data.name === 'super_admin' || data.name === 'admin' || data.name === 'product_manager' ||
      data.name === 'order_manager' || data.name === 'support_executive' || data.name === 'customer') {
    throw ApiError.badRequest('This is a reserved system role name');
  }
  const existing = await roleRepository.findByName(data.name);
  if (existing) throw ApiError.conflict('Role with this name already exists');
  const role = await roleRepository.create({ ...data, isSystem: false, isActive: true });
  invalidateCache();
  return role.toSafeObject ? role.toSafeObject() : role;
};

export const updateRole = async (name, data) => {
  const role = await roleRepository.findByName(name);
  if (!role) throw ApiError.notFound('Role not found');

  if (name === 'super_admin') {
    const PROTECTED = ['roles.manage', 'permissions.manage', 'audit.logs.read',
                       'settings.paymentKeys.manage', 'users.role.assign', 'users.delete'];
    const newPerms = data.permissions || role.permissions;
    for (const p of PROTECTED) {
      if (!newPerms.includes(p)) {
        throw ApiError.badRequest(`Critical permission ${p} cannot be removed from super_admin`);
      }
    }
  }

  if (name === 'super_admin' && data.isActive === false) {
    throw ApiError.badRequest('Super Admin role cannot be deactivated');
  }

  const updated = await roleRepository.updateByName(name, data);
  invalidateCache();
  return updated.toSafeObject ? updated.toSafeObject() : updated;
};

export const deleteRole = async (name) => {
  if (name === 'super_admin' || name === 'admin' || name === 'product_manager' ||
      name === 'order_manager' || name === 'support_executive' || name === 'customer') {
    throw ApiError.badRequest('System roles cannot be deleted');
  }
  await roleRepository.deleteByName(name);
  invalidateCache();
  return { deleted: true, name };
};
