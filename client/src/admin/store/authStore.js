import { create } from "zustand";
import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const ADMIN_ROLES = ["admin", "super_admin", "product_manager", "order_manager", "support_executive"];

const normalizeUser = (user) => ({
  id: user.id || user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  name: user.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "",
  email: user.email,
  role: user.role ? user.role.replace(" ", "_") : "customer",
  permissions: user.permissions || undefined,
  avatar: user.avatar?.url || (typeof user.avatar === "string" ? user.avatar : null),
  phone: user.phone || "",
});

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: true,

hydrate: async () => {
     try {
       const { data } = await api.get(ENDPOINTS.AUTH.PROFILE, { _skipAuthRedirect: true });
       const serverUser = data.data;
       const normalized = normalizeUser(serverUser);
       const isAdmin = ADMIN_ROLES.includes(normalized.role);
       set({ user: isAdmin ? normalized : null, isAuthenticated: isAdmin });
     } catch {
       set({ user: null, isAuthenticated: false });
     } finally {
       set({ isHydrating: false });
     }
   },

login: async (credentials) => {
     const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
     const user = data.data;
     set({
       user: normalizeUser(user),
       isAuthenticated: true,
     });
   },

  logout: async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT, null, { _skipAuthRedirect: true });
    } catch {
      // ignore
    }
    ["rigcraft_token", "accessToken", "rigcraft_auth", "rigcraft_user", "admin-auth-storage"].forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // storage unavailable
      }
    });
    set({ user: null, isAuthenticated: false });
    window.dispatchEvent(new Event("rigcraft:auth-logout"));
  },

  setUser: (userData) => {
    set({ user: normalizeUser(userData) });
  },
}));

export default useAuthStore;

if (typeof window !== "undefined") {
  // Session is proven by the HttpOnly cookie at boot, before any route renders.
  useAuthStore.getState().hydrate();
  window.addEventListener("rigcraft:auth-logout", () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });
}