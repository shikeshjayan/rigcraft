import React from 'react';
import PrebuildHero from '../sections/PrebuildHero';
import PrebuildCatalog from '../sections/PrebuildCatalog';

const Prebuild = () => {
  return (
    <>
      {/* 1st section: bg-primary */}
      <PrebuildHero />
      
      {/* 2nd section: bg-secondary */}
      <PrebuildCatalog />
    </>
  );
};

export default Prebuild;
