import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Prebuild from './pages/Prebuild';
import Footer from './components/Footer';
import Pcbuilder from './pages/Pcbuilder';
import Components from './pages/Components';
import Detail from './pages/Detail';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Dels from './pages/Dels';
import AllActiveDeals from './pages/AllActiveDeals';
import AllBundleDeals from './pages/AllBundleDeals';
import Customerlogin from './pages/Customerlogin';
import CustomerRegister from './pages/CustomerRegister';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Warranty from './pages/Warranty';
import ReturnsAndRefunds from './pages/ReturnsAndRefunds';
import PcBuilderGuide from './pages/PcBuilderGuide';
import Faq from './pages/Faq';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import About from './pages/About';
import { WishlistProvider } from './context/WishlistContext';
import AdminRoutes from './admin/routes/AdminRoutes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Chatbot from './components/Chatbot';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';

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
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <div className="flex-grow bg-white">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/prebuild" element={<Prebuild />} />
                  <Route path="/builder" element={<Pcbuilder />} />
                  <Route path="/components" element={<Components />} />
                  <Route path="/components/:category" element={<Components />} />
                  <Route path="/detail/:id" element={<Detail />} />
                  <Route path="/detail/:productName/:id" element={<Detail />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/deals" element={<Dels />} />
                  <Route path="/alldeals" element={<AllActiveDeals />} />
                  <Route path="/bundle" element={<AllBundleDeals />} />
                  <Route path="/login" element={<Customerlogin />} />
                  <Route path="/register" element={<CustomerRegister />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/warranty" element={<Warranty />} />
                  <Route path="/returns" element={<ReturnsAndRefunds />} />
                  <Route path="/pc-builder-guide" element={<PcBuilderGuide />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<Terms />} />
                  <Route path="/about" element={<About />} />
                </Route>
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
