import React from 'react';
import PrebuildHero from '../sections/PrebuildHero';
import PrebuildCatalog from '../sections/PrebuildCatalog';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';

const Prebuild = () => {
  return (
    <>
      <div className="relative z-40 max-w-[1500px] mx-auto px-4 lg:px-8 pt-4 pb-0 bg-[var(--color-bg-primary)]">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Prebuilt PCs' }]} />
      </div>
      {/* 1st section: bg-primary */}
      <FadeUp delay={0.1}><PrebuildHero /></FadeUp>
      
      {/* 2nd section: bg-secondary */}
      <FadeUp delay={0.2}><PrebuildCatalog /></FadeUp>
    </>
  );
};

export default Prebuild;
