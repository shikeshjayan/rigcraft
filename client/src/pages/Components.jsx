import React from 'react';
import ComponentsHero from '../sections/ComponentsHero';
import ComponentsCatalog from '../sections/ComponentsCatalog';
import FadeUp from '../components/FadeUp';

const Components = () => {
  return (
    <>
      {/* 1st section: bg-primary */}
      <FadeUp delay={0.1}><ComponentsHero /></FadeUp>
      
      {/* 2nd section: bg-secondary */}
      <FadeUp delay={0.2}><ComponentsCatalog /></FadeUp>
    </>
  );
};

export default Components;
