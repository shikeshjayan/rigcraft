import { BuilderProvider } from '../context/BuilderContext';
import BuilderHero from '../sections/BuilderHero';
import BuilderWorkspace from '../sections/BuilderWorkspace';
import BuilderCompatibility from '../sections/BuilderCompatibility';
import BuilderPerformance from '../sections/BuilderPerformance';
import BuilderCostBreakdown from '../sections/BuilderCostBreakdown';
import BuilderUpgrades from '../sections/BuilderUpgrades';
import BuilderAccessories from '../sections/BuilderAccessories';
import BuilderRecentlyViewed from '../sections/BuilderRecentlyViewed';
import BuilderWhyUs from '../sections/BuilderWhyUs';
import BuilderFAQ from '../sections/BuilderFAQ';
import FadeUp from '../components/FadeUp';

const Pcbuilder = () => {
  return (
    <BuilderProvider>
      <FadeUp delay={0.1}><BuilderHero /></FadeUp>
      <FadeUp delay={0.2}><BuilderWorkspace /></FadeUp>
      <FadeUp delay={0.2}><BuilderCompatibility /></FadeUp>
      <FadeUp delay={0.2}><BuilderPerformance /></FadeUp>
      <FadeUp delay={0.2}><BuilderCostBreakdown /></FadeUp>
      <FadeUp delay={0.2}><BuilderUpgrades /></FadeUp>
      <FadeUp delay={0.2}><BuilderAccessories /></FadeUp>
      <FadeUp delay={0.2}><BuilderRecentlyViewed /></FadeUp>
      <FadeUp delay={0.2}><BuilderWhyUs /></FadeUp>
      <FadeUp delay={0.2}><BuilderFAQ /></FadeUp>
    </BuilderProvider>
  );
};

export default Pcbuilder;
