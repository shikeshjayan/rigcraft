import { create } from "zustand";
import { settingsService } from "../services/settingsService";

const useSettingsStore = create((set) => ({
  storeName: "RigCraft",
  logo: null,

  fetchSettings: async () => {
    try {
      const data = await settingsService.get();
      set({
        storeName: data.storeName || "RigCraft",
        logo: data.logo?.url ? data.logo : null,
      });
    } catch {
      // silent
    }
  },

  setBrand: (storeName, logo) => set({ storeName, logo }),
}));

export default useSettingsStore;
