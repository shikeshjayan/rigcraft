import { ROLE_PERMISSIONS } from '../constants/role-permissions.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const hasPermission = (...requiredPermissions) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized('Not authorized');

    const userRole = req.user.role;
    const rolePerms = ROLE_PERMISSIONS[userRole];

    if (!rolePerms) {
      throw ApiError.forbidden('Invalid role');
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      rolePerms.includes(perm)
    );

    if (!hasAllPermissions) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  });

export const hasAnyPermission = (...requiredPermissions) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized('Not authorized');

    const userRole = req.user.role;
    const rolePerms = ROLE_PERMISSIONS[userRole];

    if (!rolePerms) {
      throw ApiError.forbidden('Invalid role');
    }

    const hasAtLeastOne = requiredPermissions.some((perm) =>
      rolePerms.includes(perm)
    );

    if (!hasAtLeastOne) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  });

export const hasAllPermissions = (...requiredPermissions) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized('Not authorized');

    const userRole = req.user.role;
    const rolePerms = ROLE_PERMISSIONS[userRole];

    if (!rolePerms) {
      throw ApiError.forbidden('Invalid role');
    }

    const hasAll = requiredPermissions.every((perm) =>
      rolePerms.includes(perm)
    );

    if (!hasAll) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  });