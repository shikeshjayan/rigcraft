import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { NotificationProvider } from './context/NotificationContext';
import { WishlistProvider } from './context/WishlistContext';
import { PublicSettingsProvider } from './context/PublicSettingsContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/toast/ToastProvider';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import { useRouteMeta } from './utils/seo';

const Home = lazy(() => import('./pages/Home'));
const Prebuild = lazy(() => import('./pages/Prebuild'));
const Pcbuilder = lazy(() => import('./pages/Pcbuilder'));
const Components = lazy(() => import('./pages/Components'));
const Detail = lazy(() => import('./pages/Detail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Cart = lazy(() => import('./pages/Cart'));
const Deals = lazy(() => import('./pages/Deals'));
const AllDeals = lazy(() => import('./pages/AllDeals'));
const BundleDetail = lazy(() => import('./pages/BundleDetail'));
const Customerlogin = lazy(() => import('./pages/Customerlogin'));
const CustomerRegister = lazy(() => import('./pages/CustomerRegister'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const MyTickets = lazy(() => import('./pages/MyTickets'));
const TicketDetail = lazy(() => import('./pages/TicketDetail'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Warranty = lazy(() => import('./pages/Warranty'));
const ReturnsAndRefunds = lazy(() => import('./pages/ReturnsAndRefunds'));
const PcBuilderGuide = lazy(() => import('./pages/PcBuilderGuide'));
const Faq = lazy(() => import('./pages/Faq'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Error = lazy(() => import('./pages/Error'));
const AdminRoutes = lazy(() => import('./admin/routes/AdminRoutes'));

const BackToTop = lazy(() => import('./components/BackToTop'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const DealStickyBar = lazy(() => import('./sections/DealStickyBar'));
const FirstOrderCoupon = lazy(() => import('./components/FirstOrderCoupon'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const PublicLayout = () => {
  const location = useLocation();
  useRouteMeta(location.pathname);
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <FirstOrderCoupon />
      </Suspense>
      <div className="flex-grow bg-white">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </div>
      <Footer hideNewsletter={location.pathname === '/deals'} />
      <Suspense fallback={null}>
        <Chatbot />
        <BackToTop />
        <DealStickyBar />
      </Suspense>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <NotificationProvider>
                <PublicSettingsProvider>
                  <Routes>
                    <Route path="/admin/*" element={<Suspense fallback={null}><AdminRoutes /></Suspense>} />
                    <Route element={<PublicLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/prebuild" element={<Prebuild />} />
                      <Route path="/builder" element={<Pcbuilder />} />
                      <Route path="/components" element={<Components />} />
                      <Route path="/components/:category" element={<Components />} />
                      <Route path="/detail/:id" element={<Detail />} />
                      <Route path="/detail/:productName/:id" element={<Detail />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/deals" element={<Deals />} />
                      <Route path="/alldeals" element={<AllDeals />} />
                      <Route path="/bundle/:slug" element={<BundleDetail />} />
                      <Route path="/login" element={<Customerlogin />} />
                      <Route path="/register" element={<CustomerRegister />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/my-tickets" element={<MyTickets />} />
                      <Route path="/my-tickets/:id" element={<TicketDetail />} />
                      <Route path="/warranty" element={<Warranty />} />
                      <Route path="/returns" element={<ReturnsAndRefunds />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/pc-builder-guide" element={<PcBuilderGuide />} />
                      <Route path="/faq" element={<Faq />} />
                      <Route path="/help" element={<HelpCenter />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<Terms />} />
                      <Route path="/about" element={<About />} />
                      <Route path="*" element={<Error />} />
                    </Route>
                  </Routes>
                </PublicSettingsProvider>
                </NotificationProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;