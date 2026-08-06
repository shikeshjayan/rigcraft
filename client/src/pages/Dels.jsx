import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DealsHero from '../sections/DealsHero';
import DealStats from '../sections/DealStats';
import DealsCatalog from '../sections/DealsCatalog';
import DealsBundleSection from '../sections/DealsBundleSection';
import HeroOffer from '../sections/HeroOffer';
import WhyShopDeals from '../sections/WhyShopDeals';
import DealsNewsletter from '../sections/DealsNewsletter';
import DealsBrands from '../sections/DealsBrands';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';

const Dels = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToCatalog) {
      const timer = setTimeout(() => {
        document.getElementById('deals-catalog')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [location.state]);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 pt-4 pb-0 w-full" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Deals' }]} />
      </div>
      {/* The sections handle their own alternating background colors via inline styles */}
      <FadeUp delay={0.1}><DealsHero /></FadeUp>
      <FadeUp delay={0.15}><DealStats /></FadeUp>
      <FadeUp delay={0.2}><DealsCatalog /></FadeUp>
      <FadeUp delay={0.2}><DealsBundleSection /></FadeUp>
      <FadeUp delay={0.2}><HeroOffer /></FadeUp>
      <FadeUp delay={0.2}><WhyShopDeals /></FadeUp>
      <FadeUp delay={0.2}><DealsNewsletter /></FadeUp>
      <FadeUp delay={0.2}><DealsBrands /></FadeUp>
    </div>
  );
};

export default Dels;
