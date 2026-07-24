import React from 'react';
import PrebuildHero from '../sections/PrebuildHero';
import PrebuildCatalog from '../sections/PrebuildCatalog';
import FadeUp from '../components/FadeUp';

const Prebuild = () => {
  return (
    <>
      {/* 1st section: bg-primary */}
      <FadeUp delay={0.1}><PrebuildHero /></FadeUp>
      
      {/* 2nd section: bg-secondary */}
      <FadeUp delay={0.2}><PrebuildCatalog /></FadeUp>
    </>
  );
};

export default Prebuild;
