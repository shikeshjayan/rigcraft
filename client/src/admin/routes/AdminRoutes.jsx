import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import { ToastProvider } from "../components/common/Toast";
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
import DealList from "../pages/deals/DealList";
import DealCreate from "../pages/deals/DealCreate";
import DealEdit from "../pages/deals/DealEdit";
import FaqList from "../pages/faqs/FaqList";
import FaqCreate from "../pages/faqs/FaqCreate";
import FaqEdit from "../pages/faqs/FaqEdit";
import SupportList from "../pages/support/SupportList";
import SupportDetails from "../pages/support/SupportDetails";
import NotificationList from "../pages/notifications/NotificationList";
import NotificationDetails from "../pages/notifications/NotificationDetails";
import { ROLES } from "../constants/status";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Navigate to="/login" replace />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <ToastProvider>
              <AdminLayout />
            </ToastProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/new" element={<CategoryCreate />} />
        <Route path="categories/:id/edit" element={<CategoryEdit />} />

        <Route path="brands" element={<BrandList />} />
        <Route path="brands/new" element={<BrandCreate />} />
        <Route path="brands/:id/edit" element={<BrandEdit />} />

        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductCreate />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="products/:id/edit" element={<ProductEdit />} />

        <Route path="prebuilt" element={<PrebuiltList />} />
        <Route path="prebuilt/new" element={<PrebuiltCreate />} />
        <Route path="prebuilt/:id" element={<PrebuiltDetails />} />
        <Route path="prebuilt/:id/edit" element={<PrebuiltEdit />} />

        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetails />} />

        <Route path="coupons" element={<CouponList />} />
        <Route path="coupons/new" element={<CouponCreate />} />
        <Route path="coupons/:id/edit" element={<CouponEdit />} />

        <Route path="reviews" element={<ReviewList />} />
        <Route path="reviews/:id" element={<ReviewDetails />} />

        <Route path="users" element={<UserList />} />
        <Route path="users/:id" element={<UserDetails />} />

        <Route path="deals" element={<DealList />} />
        <Route path="deals/new" element={<DealCreate />} />
        <Route path="deals/:id/edit" element={<DealEdit />} />

        <Route path="faqs" element={<FaqList />} />
        <Route path="faqs/new" element={<FaqCreate />} />
        <Route path="faqs/:id/edit" element={<FaqEdit />} />

        <Route path="support" element={<SupportList />} />
        <Route path="support/:id" element={<SupportDetails />} />

        <Route path="notifications" element={<NotificationList />} />
        <Route path="notifications/:id" element={<NotificationDetails />} />

        <Route path="newsletter" element={<NewsletterList />} />

        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
