import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CartHero from '../sections/CartHero';
import CartWorkspace from '../sections/CartWorkspace';
import CartSuggestions from '../sections/CartSuggestions';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';

const Cart = () => {
  const location = useLocation();
  const stepParam = new URLSearchParams(location.search).get('step') || 'bag';
  const [checkoutStep, setCheckoutStep] = useState(stepParam); // 'bag', 'address', 'payment'

  // If URL changes dynamically while on the page
  useEffect(() => {
    const step = new URLSearchParams(location.search).get('step');
    if (step) {
      setCheckoutStep(step);
    }
  }, [location.search]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 pt-4 pb-0" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Shopping Cart' }]} />
      </div>
      <FadeUp delay={0.1}><CartHero checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} /></FadeUp>
      <FadeUp delay={0.2}><CartWorkspace checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} /></FadeUp>
      {checkoutStep === 'bag' && <FadeUp delay={0.2}><CartSuggestions /></FadeUp>}
    </>
  );
};

export default Cart;
