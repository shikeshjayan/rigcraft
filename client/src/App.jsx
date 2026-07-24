import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

const App = () => {
  return (
    <BrowserRouter>
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
              </Routes>
            </div>
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
