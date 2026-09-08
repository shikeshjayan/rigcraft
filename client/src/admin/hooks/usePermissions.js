import useAuthStore from "../store/authStore";
import { ROLE_PERMISSIONS } from "../constants/permissions";

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Fallback to role permissions if no customized array is present
    const perms = user.permissions !== undefined ? user.permissions : (ROLE_PERMISSIONS[user.role] || []);
    return perms.includes(permission);
  };

  return { hasPermission };
};
