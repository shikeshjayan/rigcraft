import React, { useEffect } from 'react';
import DealsHero from '../sections/DealsHero';
import ActiveDeals from '../sections/ActiveDeals';
import BundleDeals from '../sections/BundleDeals';
import DealsBrands from '../sections/DealsBrands';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';

const Dels = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 pt-4 pb-0 w-full" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Deals' }]} />
      </div>
      {/* The sections handle their own alternating background colors via inline styles */}
      <FadeUp delay={0.1}><DealsHero /></FadeUp>
      <FadeUp delay={0.2}><ActiveDeals /></FadeUp>
      <FadeUp delay={0.2}><BundleDeals /></FadeUp>
      <FadeUp delay={0.2}><DealsBrands /></FadeUp>
    </div>
  );
};

export default Dels;
