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
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "admin-auth-storage",
    }
  )
);

export default useAuthStore;
