import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Prebuild from './pages/Prebuild';
import Footer from './components/Footer';

import Detail from './pages/Detail';
import ComponentsCatalog from './pages/ComponentsCatalog';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-grow bg-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prebuild" element={<Prebuild />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/components/:category" element={<ComponentsCatalog />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
