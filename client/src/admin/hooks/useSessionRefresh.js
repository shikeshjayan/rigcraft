import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import api from "../../shared/api/axios";

export function useSessionRefresh(interval = 5 * 60 * 1000) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refresh = async () => {
      try {
        const { data } = await api.get("/auth/profile", { _skipAuthRedirect: true });
        const user = data?.data;
        if (user) {
          useAuthStore.getState().setUser(user);
        }
      } catch {
        // ignore refresh failures
      }
    };

    const timer = setInterval(refresh, interval);

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [isAuthenticated, interval]);
}

export default useSessionRefresh;