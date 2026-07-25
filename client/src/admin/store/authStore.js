import { create } from "zustand";

const MOCK_USER = {
  id: 1,
  name: "John Admin",
  email: "admin@rigcraft.com",
  role: "super_admin",
  avatar: null,
};

const useAuthStore = create((set) => ({
  user: MOCK_USER,
  isAuthenticated: true,

  login: async (credentials) => {
    const user = MOCK_USER;
    set({ user, isAuthenticated: true });
    return user;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
