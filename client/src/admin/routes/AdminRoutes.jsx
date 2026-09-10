import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import useAuthStore from "../store/authStore";
import { usePermissions } from "../hooks";
import { PERMISSIONS } from "../constants/permissions";
import Dashboard from "../pages/dashboard/Dashboard";
import CategoryList from "../pages/categories/CategoryList";
import CategoryCreate from "../pages/categories/CategoryCreate";
import CategoryEdit from "../pages/categories/CategoryEdit";
import BrandList from "../pages/brands/BrandList";
import BrandCreate from "../pages/brands/BrandCreate";
import BrandEdit from "../pages/brands/BrandEdit";
import ProductList from "../pages/products/ProductList";
import ProductCreate from "../pages/products/ProductCreate";
import ProductEdit from "../pages/products/ProductEdit";
import ProductDetails from "../pages/products/ProductDetails";
import PrebuiltList from "../pages/prebuilt/PrebuiltList";
import PrebuiltCreate from "../pages/prebuilt/PrebuiltCreate";
import PrebuiltEdit from "../pages/prebuilt/PrebuiltEdit";
import PrebuiltDetails from "../pages/prebuilt/PrebuiltDetails";
import OrderList from "../pages/orders/OrderList";
import OrderDetails from "../pages/orders/OrderDetails";
import CouponList from "../pages/coupons/CouponList";
import CouponCreate from "../pages/coupons/CouponCreate";
import CouponEdit from "../pages/coupons/CouponEdit";
import ReviewList from "../pages/reviews/ReviewList";
import ReviewDetails from "../pages/reviews/ReviewDetails";
import UserList from "../pages/users/UserList";
import UserDetails from "../pages/users/UserDetails";
import Settings from "../pages/settings/Settings";
import Profile from "../pages/profile/Profile";
import NewsletterList from "../pages/newsletter/NewsletterList";
import RolesAccessList from "../pages/roles/RolesAccessList";
import DealList from "../pages/deals/DealList";
import DealCreate from "../pages/deals/DealCreate";
import DealEdit from "../pages/deals/DealEdit";
import BundleList from "../pages/bundles/BundleList";
import BundleCreate from "../pages/bundles/BundleCreate";
import BundleEdit from "../pages/bundles/BundleEdit";
import FaqList from "../pages/faqs/FaqList";
import FaqCreate from "../pages/faqs/FaqCreate";
import FaqEdit from "../pages/faqs/FaqEdit";
import SupportList from "../pages/support/SupportList";
import SupportDetails from "../pages/support/SupportDetails";
import NotificationList from "../pages/notifications/NotificationList";
import NotificationDetails from "../pages/notifications/NotificationDetails";
import { ROLES } from "../constants/status";

const RoleBasedRedirect = () => {
  const { user } = useAuthStore();
  const normalizedRole = user?.role ? user.role.replace(" ", "_") : "customer";

  const rolePaths = {
    super_admin: 'dashboard',
    admin: 'dashboard',
    product_manager: 'products',
    order_manager: 'orders',
    support_executive: 'support',
  };

  return <Navigate to={rolePaths[normalizedRole] || 'dashboard'} replace />;
};

const PermissionRoute = ({ children, requiredPermissions, allowedRoles }) => {
  const { hasPermission } = usePermissions();
  const user = useAuthStore((state) => state.user);

  if (allowedRoles) {
    const normalizedRole = user?.role ? user.role.replace(" ", "_") : "customer";
    if (!allowedRoles.includes(normalizedRole)) {
      return <Navigate to="/admin" replace />;
    }
  }

  if (!requiredPermissions) return children;
  const hasAccess = requiredPermissions.some(p => hasPermission(p));
  return hasAccess ? children : <Navigate to="/admin" replace />;
};

const AdminRoutes = () => {
  const hydrate = useAuthStore((state) => state.hydrate);
  
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="login" element={<Navigate to="/login" replace />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "super_admin", "product_manager", "order_manager", "support_executive"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleBasedRedirect />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="categories" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.categories.read, PERMISSIONS.categories.create, PERMISSIONS.categories.update, PERMISSIONS.categories.delete, PERMISSIONS.categories.toggleStatus]}><CategoryList /></PermissionRoute>} />
        <Route path="categories/new" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.categories.read, PERMISSIONS.categories.create, PERMISSIONS.categories.update, PERMISSIONS.categories.delete, PERMISSIONS.categories.toggleStatus]}><CategoryCreate /></PermissionRoute>} />
        <Route path="categories/:id/edit" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.categories.read, PERMISSIONS.categories.create, PERMISSIONS.categories.update, PERMISSIONS.categories.delete, PERMISSIONS.categories.toggleStatus]}><CategoryEdit /></PermissionRoute>} />

        <Route path="brands" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.brands.read, PERMISSIONS.brands.create, PERMISSIONS.brands.update, PERMISSIONS.brands.delete]}><BrandList /></PermissionRoute>} />
        <Route path="brands/new" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.brands.read, PERMISSIONS.brands.create, PERMISSIONS.brands.update, PERMISSIONS.brands.delete]}><BrandCreate /></PermissionRoute>} />
        <Route path="brands/:id/edit" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.brands.read, PERMISSIONS.brands.create, PERMISSIONS.brands.update, PERMISSIONS.brands.delete]}><BrandEdit /></PermissionRoute>} />

        <Route path="products" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.products.read, PERMISSIONS.products.create, PERMISSIONS.products.update, PERMISSIONS.products.delete, PERMISSIONS.products.managePricing, PERMISSIONS.products.manageStock, PERMISSIONS.products.manageSpecifications, PERMISSIONS.products.manageCompatibility, PERMISSIONS.products.manageImages, PERMISSIONS.products.publish]}><ProductList /></PermissionRoute>} />
        <Route path="products/new" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.products.read, PERMISSIONS.products.create, PERMISSIONS.products.update, PERMISSIONS.products.delete, PERMISSIONS.products.managePricing, PERMISSIONS.products.manageStock, PERMISSIONS.products.manageSpecifications, PERMISSIONS.products.manageCompatibility, PERMISSIONS.products.manageImages, PERMISSIONS.products.publish]}><ProductCreate /></PermissionRoute>} />
        <Route path="products/:id" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.products.read, PERMISSIONS.products.create, PERMISSIONS.products.update, PERMISSIONS.products.delete, PERMISSIONS.products.managePricing, PERMISSIONS.products.manageStock, PERMISSIONS.products.manageSpecifications, PERMISSIONS.products.manageCompatibility, PERMISSIONS.products.manageImages, PERMISSIONS.products.publish]}><ProductDetails /></PermissionRoute>} />
        <Route path="products/:id/edit" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.products.read, PERMISSIONS.products.create, PERMISSIONS.products.update, PERMISSIONS.products.delete, PERMISSIONS.products.managePricing, PERMISSIONS.products.manageStock, PERMISSIONS.products.manageSpecifications, PERMISSIONS.products.manageCompatibility, PERMISSIONS.products.manageImages, PERMISSIONS.products.publish]}><ProductEdit /></PermissionRoute>} />

        <Route path="prebuilt" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.prebuilts.read, PERMISSIONS.prebuilts.create, PERMISSIONS.prebuilts.update, PERMISSIONS.prebuilts.delete, PERMISSIONS.prebuilts.publish]}><PrebuiltList /></PermissionRoute>} />
        <Route path="prebuilt/new" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.prebuilts.read, PERMISSIONS.prebuilts.create, PERMISSIONS.prebuilts.update, PERMISSIONS.prebuilts.delete, PERMISSIONS.prebuilts.publish]}><PrebuiltCreate /></PermissionRoute>} />
        <Route path="prebuilt/:id" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.prebuilts.read, PERMISSIONS.prebuilts.create, PERMISSIONS.prebuilts.update, PERMISSIONS.prebuilts.delete, PERMISSIONS.prebuilts.publish]}><PrebuiltDetails /></PermissionRoute>} />
        <Route path="prebuilt/:id/edit" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={[PERMISSIONS.prebuilts.read, PERMISSIONS.prebuilts.create, PERMISSIONS.prebuilts.update, PERMISSIONS.prebuilts.delete, PERMISSIONS.prebuilts.publish]}><PrebuiltEdit /></PermissionRoute>} />

        <Route path="orders" element={<PermissionRoute allowedRoles={["super_admin", "admin", "order_manager"]} requiredPermissions={Object.values(PERMISSIONS.orders)}><OrderList /></PermissionRoute>} />
        <Route path="orders/:id" element={<PermissionRoute allowedRoles={["super_admin", "admin", "order_manager"]} requiredPermissions={Object.values(PERMISSIONS.orders)}><OrderDetails /></PermissionRoute>} />

        <Route path="coupons" element={<PermissionRoute allowedRoles={["super_admin", "admin", "order_manager"]} requiredPermissions={Object.values(PERMISSIONS.coupons)}><CouponList /></PermissionRoute>} />
        <Route path="coupons/new" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.coupons)}><CouponCreate /></PermissionRoute>} />
        <Route path="coupons/:id/edit" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.coupons)}><CouponEdit /></PermissionRoute>} />

        <Route path="reviews" element={<PermissionRoute allowedRoles={["super_admin", "admin", "support_executive"]} requiredPermissions={Object.values(PERMISSIONS.reviews)}><ReviewList /></PermissionRoute>} />
        <Route path="reviews/:id" element={<PermissionRoute allowedRoles={["super_admin", "admin", "support_executive"]} requiredPermissions={Object.values(PERMISSIONS.reviews)}><ReviewDetails /></PermissionRoute>} />

        <Route path="users" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.users)}><UserList /></PermissionRoute>} />
        <Route path="users/:id" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.users)}><UserDetails /></PermissionRoute>} />

        <Route path="deals" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.deals)}><DealList /></PermissionRoute>} />
        <Route path="deals/new" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.deals)}><DealCreate /></PermissionRoute>} />
        <Route path="deals/:id/edit" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.deals)}><DealEdit /></PermissionRoute>} />

        <Route path="bundles" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={Object.values(PERMISSIONS.bundles)}><BundleList /></PermissionRoute>} />
        <Route path="bundles/new" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={Object.values(PERMISSIONS.bundles)}><BundleCreate /></PermissionRoute>} />
        <Route path="bundles/:id/edit" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager"]} requiredPermissions={Object.values(PERMISSIONS.bundles)}><BundleEdit /></PermissionRoute>} />

        <Route path="faqs" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.faqs)}><FaqList /></PermissionRoute>} />
        <Route path="faqs/new" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.faqs)}><FaqCreate /></PermissionRoute>} />
        <Route path="faqs/:id/edit" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.faqs)}><FaqEdit /></PermissionRoute>} />

        <Route path="support" element={<PermissionRoute allowedRoles={["super_admin", "admin", "support_executive"]} requiredPermissions={Object.values(PERMISSIONS.support)}><SupportList /></PermissionRoute>} />
        <Route path="support/:id" element={<PermissionRoute allowedRoles={["super_admin", "admin", "support_executive"]} requiredPermissions={Object.values(PERMISSIONS.support)}><SupportDetails /></PermissionRoute>} />

        <Route path="notifications" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager", "order_manager", "support_executive"]} requiredPermissions={[PERMISSIONS.notifications.adminList]}><NotificationList /></PermissionRoute>} />
        <Route path="notifications/:id" element={<PermissionRoute allowedRoles={["super_admin", "admin", "product_manager", "order_manager", "support_executive"]} requiredPermissions={[PERMISSIONS.notifications.adminList]}><NotificationDetails /></PermissionRoute>} />

        <Route path="newsletter" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.newsletter)}><NewsletterList /></PermissionRoute>} />

        <Route path="settings" element={<PermissionRoute allowedRoles={["super_admin", "admin"]} requiredPermissions={Object.values(PERMISSIONS.settings)}><Settings /></PermissionRoute>} />
        <Route path="profile" element={<Profile />} />
        
        <Route path="settings/roles" element={<ProtectedRoute allowedRoles={["super_admin", "admin"]}><PermissionRoute requiredPermissions={Object.values(PERMISSIONS.roles)}><RolesAccessList /></PermissionRoute></ProtectedRoute>} />
        <Route path="settings/roles/:id" element={<ProtectedRoute allowedRoles={["super_admin", "admin"]}><PermissionRoute requiredPermissions={Object.values(PERMISSIONS.roles)}><UserDetails /></PermissionRoute></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<RoleBasedRedirect />} />
    </Routes>
  );
};

export default AdminRoutes;
