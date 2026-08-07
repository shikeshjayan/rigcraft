import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import FadeUp from '../components/FadeUp';
import HeroReview from '../sections/HeroReview';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      
      {/* 1. Hero Section */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80")' }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-[1400px] mx-auto mt-16">
          <div className="mb-4 flex justify-center">
            <Breadcrumb
              variant="dark"
              items={[
                { label: 'Home', path: '/' },
                { label: 'About RigCraft' }
              ]}
            />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider mb-6"
          >
            About <span className="text-[var(--color-primary)]">RigCraft</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200 font-medium max-w-2xl mx-auto"
          >
            Crafting India's most powerful, beautifully designed custom gaming PCs.
          </motion.p>
        </div>
      </section>

      {/* 2. About the Company Section */}
      <section className="w-full py-20 px-6 lg:px-8 bg-gray-50">
        <FadeUp>
          <div className="max-w-4xl mx-auto text-center">
            <h4 className="text-[14px] font-bold text-[var(--color-primary)] tracking-[3px] uppercase mb-4">Who We Are</h4>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 uppercase tracking-wide">
              Powering Your Next Victory
            </h2>
            <div className="text-gray-600 text-[16px] md:text-[18px] leading-relaxed font-medium space-y-6 text-left">
              <p>
                Founded in 2025, RigCraft was born out of a simple frustration: building a high-end, custom gaming PC was too complicated, too risky, and lacked the premium customer experience that gamers deserve. We set out to change that.
              </p>
              <p>
                Based in India, our team of expert builders, hardware enthusiasts, and software developers works tirelessly to ensure that every RigCraft PC is a masterpiece. From our proprietary compatibility engine that guarantees your selected components will work perfectly together, to our obsessive cable management and rigorous stress testing, we leave no stone unturned.
              </p>
              <p>
                Whether you're a professional esports athlete, a hardcore streamer, or just stepping into the world of PC gaming, RigCraft provides the ultimate platform to build, buy, and experience the best hardware on the planet.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* 3. Contact Section */}
      <section className="w-full py-24 px-6 lg:px-8 bg-white border-y border-gray-200">
        <FadeUp>
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 uppercase tracking-wide">
              Have Questions?
            </h2>
            <p className="text-gray-600 text-lg font-medium mb-10 max-w-2xl">
              Our support team of PC building experts is available 24/7. We'd love to hear from you and help you design the rig of your dreams.
            </p>
            <Link to="/">
              <button className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-10 py-4 rounded-sm font-bold text-[16px] uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <EmailOutlinedIcon />
                Contact Us
              </button>
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* 4. Reviews Section */}
      <FadeUp delay={0.2}>
        <HeroReview />
      </FadeUp>

    </div>
  );
};

export default About;
