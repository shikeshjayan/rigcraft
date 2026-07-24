import React, { useEffect } from 'react';
import DealsHero from '../sections/DealsHero';
import ActiveDeals from '../sections/ActiveDeals';
import BundleDeals from '../sections/BundleDeals';
import DealsBrands from '../sections/DealsBrands';
import FadeUp from '../components/FadeUp';

const Dels = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* The sections handle their own alternating background colors via inline styles */}
      <FadeUp delay={0.1}><DealsHero /></FadeUp>
      <FadeUp delay={0.2}><ActiveDeals /></FadeUp>
      <FadeUp delay={0.2}><BundleDeals /></FadeUp>
      <FadeUp delay={0.2}><DealsBrands /></FadeUp>
    </div>
  );
};

export default Dels;
