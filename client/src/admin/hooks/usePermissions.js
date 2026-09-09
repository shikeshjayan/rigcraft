import useAuthStore from "../store/authStore";
import { ROLE_PERMISSIONS, PERMISSIONS } from "../constants/permissions";

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  const getPermissions = () => {
    if (!user) return [];
    return user.permissions !== undefined ? user.permissions : (ROLE_PERMISSIONS[user.role] || []);
  };

  const hasPermission = (permission) => {
    return getPermissions().includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    const userPerms = getPermissions();
    return permissions.some(p => userPerms.includes(p));
  };

  const hasAllPermissions = (permissions) => {
    const userPerms = getPermissions();
    return permissions.every(p => userPerms.includes(p));
  };

  const can = (module, action) => {
    const key = PERMISSIONS[module]?.[action];
    return key ? hasPermission(key) : false;
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions, can };
};
