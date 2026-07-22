import Navbar from './components/Navbar';
import Home from './pages/Home';

import Footer from './components/Footer';

const App = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Home />
      </div>
      <Footer />
    </div>
  );
};

export default App;
