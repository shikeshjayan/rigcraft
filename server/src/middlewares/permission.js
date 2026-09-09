import { ROLE_PERMISSIONS } from '../constants/role-permissions.js';
import { getPermissions } from '../services/role.service.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getEffectivePermissions = async (user) => {
  if (!user) return [];

  // Explicit per-user permissions always win.
  // [] means the user has no permissions.
  if (user.permissions !== undefined) {
    return Array.isArray(user.permissions) ? user.permissions : [];
  }

  // No custom permissions configured.
  // Fall back to role permissions.
  let rolePerms = await getPermissions(user.role);
  if (!rolePerms) {
    rolePerms = ROLE_PERMISSIONS[user.role];
  }

  return rolePerms || [];
};

export const hasPermission = (...requiredPermissions) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized('Not authorized');

    const effectivePermissions = await getEffectivePermissions(req.user);

    const hasAllPermissions = requiredPermissions.every((perm) =>
      effectivePermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  });

export const hasAnyPermission = (...requiredPermissions) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized('Not authorized');

    const effectivePermissions = await getEffectivePermissions(req.user);

    const hasAtLeastOne = requiredPermissions.some((perm) =>
      effectivePermissions.includes(perm)
    );

    if (!hasAtLeastOne) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  });

export const hasAllPermissions = (...requiredPermissions) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized('Not authorized');

    const effectivePermissions = await getEffectivePermissions(req.user);

    const hasAll = requiredPermissions.every((perm) =>
      effectivePermissions.includes(perm)
    );

    if (!hasAll) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  });
