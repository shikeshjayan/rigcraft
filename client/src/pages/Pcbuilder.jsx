import React from 'react';
import BuilderHero from '../sections/BuilderHero';
import BuilderWorkspace from '../sections/BuilderWorkspace';
import BuilderUpgrades from '../sections/BuilderUpgrades';
import BuilderAccessories from '../sections/BuilderAccessories';
import BuilderFAQ from '../sections/BuilderFAQ';
import FadeUp from '../components/FadeUp';

const Pcbuilder = () => {
  return (
    <>
      <FadeUp delay={0.1}><BuilderHero /></FadeUp>
      <FadeUp delay={0.2}><BuilderWorkspace /></FadeUp>
      <FadeUp delay={0.2}><BuilderUpgrades /></FadeUp>
      <FadeUp delay={0.2}><BuilderAccessories /></FadeUp>
      <FadeUp delay={0.2}><BuilderFAQ /></FadeUp>
    </>
  );
};

export default Pcbuilder;
