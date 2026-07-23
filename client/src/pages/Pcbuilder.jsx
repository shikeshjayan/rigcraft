import React from 'react';
import BuilderHero from '../sections/BuilderHero';
import BuilderWorkspace from '../sections/BuilderWorkspace';
import BuilderUpgrades from '../sections/BuilderUpgrades';
import BuilderAccessories from '../sections/BuilderAccessories';
import BuilderFAQ from '../sections/BuilderFAQ';

const Pcbuilder = () => {
  return (
    <>
      <BuilderHero />
      <BuilderWorkspace />
      <BuilderUpgrades />
      <BuilderAccessories />
      <BuilderFAQ />
    </>
  );
};

export default Pcbuilder;
