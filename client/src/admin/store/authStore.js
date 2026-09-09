import { create } from "zustand";
import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
        const { user } = data.data;
        set({
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role ? user.role.replace(" ", "_") : "customer",
            permissions: user.permissions !== undefined ? user.permissions : undefined,
            avatar: user.avatar?.url || null,
            phone: user.phone || "",
          },
          isAuthenticated: true,
        });
      },

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: true,

      setUser: (userData) => {
        const normalized = {
          ...userData,
          id: userData.id || userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(' ') || '',
          role: userData.role ? userData.role.replace(" ", "_") : "customer",
          permissions: userData.permissions !== undefined ? userData.permissions : undefined,
          avatar: typeof userData.avatar === 'object' && userData.avatar ? userData.avatar.url : (userData.avatar || null),
        };
        set({ user: normalized });
      },

      hydrate: async () => {
        try {
          // Only attempt hydration if we think we're authenticated
          if (!get().isAuthenticated) return;
          
          const { data } = await api.get(ENDPOINTS.AUTH.PROFILE);
          if (data && data.data) {
            get().setUser(data.data);
          }
        } catch (error) {
          // If hydration fails (e.g. invalid token), logout the user
          get().logout();
        }
      }
    }),
    {
      name: "admin-auth-storage",
      version: 1,
      migrate: (persistedState) => {
        const user = persistedState?.user;
        if (user && !user.firstName) {
          const parts = (user.name || "").trim().split(/\s+/);
          user.firstName = user.firstName || parts[0] || "";
          user.lastName = user.lastName || parts.slice(1).join(" ") || "";
        }
        return persistedState;
      },
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

  refreshUser: async () => {
    try {
      const { data } = await api.get("/auth/profile", { _skipAuthRedirect: true });
      const serverUser = data?.data;
      if (serverUser) {
        const normalized = normalizeUser(serverUser);
        const isAdmin = ADMIN_ROLES.includes(normalized.role);
        set({ user: isAdmin ? normalized : null, isAuthenticated: isAdmin });
      }
    } catch {
      // ignore
    }
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