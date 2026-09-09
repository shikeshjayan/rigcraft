import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { usePermissions } from "../hooks/usePermissions";

const ProtectedRoute = ({ children, allowedRoles, requiredPermissions }) => {
  const { isAuthenticated, user, isHydrating } = useAuthStore();
  const { hasAllPermissions } = usePermissions();

  if (isHydrating) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAll = hasAllPermissions(requiredPermissions);
    if (!hasAll) {
      const missingPermissions = requiredPermissions.filter(p => !hasAllPermissions([p]));
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            {missingPermissions.length > 0 && (
              <div className="text-sm text-gray-500">
                <p>Missing permissions:</p>
                <ul className="list-disc list-inside mt-2">
                  {missingPermissions.map((perm, idx) => (
                    <li key={idx} className="font-mono text-red-500">{perm}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
