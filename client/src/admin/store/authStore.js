import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../shared/api/axios";
import { ENDPOINTS } from "../../shared/api/endpoints";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
        const { user, accessToken } = data.data;
        localStorage.setItem("accessToken", accessToken);
        set({
          user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            avatar: user.avatar?.url || null,
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
        localStorage.removeItem("accessToken");
        localStorage.removeItem("rigcraft_auth");
        localStorage.removeItem("rigcraft_user");
        set({ user: null, isAuthenticated: false });
      },

      setUser: (userData) => {
        const normalized = {
          ...userData,
          id: userData.id || userData._id,
          name: userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(' ') || '',
          avatar: typeof userData.avatar === 'object' && userData.avatar ? userData.avatar.url : (userData.avatar || null),
        };
        set({ user: normalized });
      },
    }),
    {
      name: "admin-auth-storage",
    }
  )
);

export default useAuthStore;
