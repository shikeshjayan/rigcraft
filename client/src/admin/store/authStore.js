import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";
import { clearToken } from "../../shared/auth/token";

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

      logout: async () => {
        try {
          await api.post(ENDPOINTS.AUTH.LOGOUT);
        } catch {
          // ignore
        }
        clearToken();
        localStorage.removeItem("rigcraft_auth");
        localStorage.removeItem("rigcraft_user");
        set({ user: null, isAuthenticated: false });
        window.dispatchEvent(new Event("rigcraft:auth-logout"));
      },

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
  )
);

export default useAuthStore;
