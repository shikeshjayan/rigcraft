import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import { ToastProvider } from "../components/common/Toast";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import { ROLES } from "../constants/status";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin", "manager"]}>
            <ToastProvider>
              <AdminLayout />
            </ToastProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
