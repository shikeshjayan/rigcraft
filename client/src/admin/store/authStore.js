import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";
import { clearToken } from "../../shared/auth/token";

const useAuthStore = create(
  persist(
    (set) => ({
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
            role: user.role,
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
      },

      setUser: (userData) => {
        const normalized = {
          ...userData,
          id: userData.id || userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(' ') || '',
          avatar: typeof userData.avatar === 'object' && userData.avatar ? userData.avatar.url : (userData.avatar || null),
        };
        set({ user: normalized });
      },
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
