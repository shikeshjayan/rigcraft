import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
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
import { WishlistProvider } from './context/WishlistContext';
import AdminRoutes from './admin/routes/AdminRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const PublicLayout = () => (
  <div className="min-h-screen bg-black text-white flex flex-col">
    <Navbar />
    <div className="flex-grow bg-white">
      <Outlet />
    </div>
    <Footer />
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>
          </Routes>
        </WishlistProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
