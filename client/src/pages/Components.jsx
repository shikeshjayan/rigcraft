import React from 'react';
import ComponentsHero from '../sections/ComponentsHero';
import ComponentsCatalog from '../sections/ComponentsCatalog';

const Components = () => {
  return (
    <>
      {/* 1st section: bg-primary */}
      <ComponentsHero />
      
      {/* 2nd section: bg-secondary */}
      <ComponentsCatalog />
    </>
  );
};

export default Components;
