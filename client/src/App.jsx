import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Prebuild from './pages/Prebuild';
import Footer from './components/Footer';
import Pcbuilder from './pages/Pcbuilder';

import Components from './pages/Components';
import Detail from './pages/Detail';
import Wishlist from './pages/Wishlist';
import { WishlistProvider } from './context/WishlistContext';

const App = () => {
  return (
    <BrowserRouter>
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
            </Routes>
          </div>
          <Footer />
        </div>
      </WishlistProvider>
    </BrowserRouter>
  );
};

export default App;
