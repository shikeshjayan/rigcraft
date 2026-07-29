import { create } from "zustand";
import { notificationService } from "../services/notificationService";

const useNotificationStore = create((set) => ({
  unreadCount: 0,
  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // silent
    }
  },
  setUnreadCount: (count) => set({ unreadCount: count }),
}));

export default useNotificationStore;
