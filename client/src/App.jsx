import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen bg-black text-white flex flex-col">
              <Navbar />
              <div className="flex-grow bg-white">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/prebuild" element={<Prebuild />} />
                  <Route path="/builder" element={<Pcbuilder />} />
                  <Route path="/components" element={<Components />} />
                  <Route path="/components/:category" element={<Components />} />
                  <Route path="/detail/:id" element={<Detail />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/deals" element={<Dels />} />
                  <Route path="/deals/active" element={<AllActiveDeals />} />
                  <Route path="/deals/bundles" element={<AllBundleDeals />} />
                  <Route path="/login" element={<Customerlogin />} />
                  <Route path="/register" element={<CustomerRegister />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/warranty" element={<Warranty />} />
                  <Route path="/returns" element={<ReturnsAndRefunds />} />
                  <Route path="/builder-guide" element={<PcBuilderGuide />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  );
};

export default App;
