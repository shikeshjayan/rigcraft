import React, { useEffect, useState } from 'react';
import CartHero from '../sections/CartHero';
import CartWorkspace from '../sections/CartWorkspace';
import CartSuggestions from '../sections/CartSuggestions';
import FadeUp from '../components/FadeUp';

const Cart = () => {
  const [checkoutStep, setCheckoutStep] = useState('bag'); // 'bag', 'address', 'payment'

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <FadeUp delay={0.1}><CartHero checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} /></FadeUp>
      <FadeUp delay={0.2}><CartWorkspace checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} /></FadeUp>
      {checkoutStep === 'bag' && <FadeUp delay={0.2}><CartSuggestions /></FadeUp>}
    </>
  );
};

export default Cart;
