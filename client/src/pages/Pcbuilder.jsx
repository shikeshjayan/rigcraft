import React from 'react';
import BuilderHero from '../sections/BuilderHero';
import BuilderWorkspace from '../sections/BuilderWorkspace';
import BuilderUpgrades from '../sections/BuilderUpgrades';
import BuilderAccessories from '../sections/BuilderAccessories';
import BuilderFAQ from '../sections/BuilderFAQ';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';

const Pcbuilder = () => {
  return (
    <>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 pt-4 pb-0 bg-[var(--color-bg-primary)]">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'PC Builder' }]} />
      </div>
      <FadeUp delay={0.1}><BuilderHero /></FadeUp>
      <FadeUp delay={0.2}><BuilderWorkspace /></FadeUp>
      <FadeUp delay={0.2}><BuilderUpgrades /></FadeUp>
      <FadeUp delay={0.2}><BuilderAccessories /></FadeUp>
      <FadeUp delay={0.2}><BuilderFAQ /></FadeUp>
    </>
  );
};

export default Pcbuilder;
