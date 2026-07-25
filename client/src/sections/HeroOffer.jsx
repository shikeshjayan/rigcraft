import React from 'react';

const HeroOffer = () => {
  return (
    <section 
      className="w-full flex items-center justify-center px-4 text-center"
      style={{ 
        height: '85px', 
        backgroundColor: 'var(--color-primary)', 
        color: 'white' 
      }}
    >
      <p className="text-sm md:text-lg font-semibold tracking-wide">
        Special Offer: Get 20% off on all prebuilt PCs! Limited time only. 
      </p>
    </section>
  );
};

export default HeroOffer;
