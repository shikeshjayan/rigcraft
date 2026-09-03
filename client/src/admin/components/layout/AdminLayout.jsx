import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";
import { connectSocket } from "../../../shared/socket";
import { useRouteMeta } from "../../../utils/seo";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const location = useLocation();
  useRouteMeta(location.pathname);

  useEffect(() => {
    if (!isAuthenticated) return;
    const handleNotif = () => fetchUnreadCount();
    let sock;
    connectSocket().then((s) => {
      if (!s) return;
      sock = s;
      sock.on("notification:new", handleNotif);
    });
    return () => {
      if (sock) sock.off("notification:new", handleNotif);
    };
  }, [isAuthenticated, fetchUnreadCount]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-admin-bg-primary overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          collapsed={sidebarCollapsed}
        />
        <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden">
          <div key={location.pathname} className="animate-admin-fade-in-up min-w-0 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
