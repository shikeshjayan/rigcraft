import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useAuthStore from "../../store/authStore";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  console.log("AdminLayout rendering, path:", location.pathname);

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div key={location.pathname} className="animate-admin-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
