import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  console.log("ProtectedRoute check:", { isAuthenticated, role: user?.role, allowedRoles });

  if (!isAuthenticated || !user) {
    console.log("Redirecting to login: Not authenticated or no user");
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("Redirecting to login: Role not allowed. User role:", user.role);
    return <Navigate to="/admin/login" replace />;
  }

  console.log("ProtectedRoute passed, rendering children");
  return children;
};

export default ProtectedRoute;
