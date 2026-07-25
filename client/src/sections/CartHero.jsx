import React from 'react';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const CartHero = ({ checkoutStep = 'bag', setCheckoutStep }) => {
  return (
    <section className="w-full border-b border-[#E2E8F0]" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-5 flex items-center justify-between">
        
        {/* Placeholder for Logo if needed, or empty space for alignment */}
        <div className="hidden md:block w-32"></div>

        {/* Stepper */}
        <div className="flex items-center gap-2 md:gap-4 flex-grow justify-center">
          <div 
            onClick={() => setCheckoutStep?.('bag')}
            className={`text-[12px] md:text-[14px] font-bold tracking-[2px] pb-1 cursor-pointer transition-colors hover:text-[#0052FF] ${checkoutStep === 'bag' ? 'text-[#0052FF] border-b-2 border-[#0052FF]' : 'text-[#64748B]'}`}
          >
            BAG
          </div>
          <div className="w-8 md:w-16 border-t border-dashed border-[#94A3B8]"></div>
          <div 
            onClick={() => setCheckoutStep?.('address')}
            className={`text-[12px] md:text-[14px] font-bold tracking-[2px] pb-1 cursor-pointer transition-colors hover:text-[#0052FF] ${checkoutStep === 'address' ? 'text-[#0052FF] border-b-2 border-[#0052FF]' : 'text-[#64748B]'}`}
          >
            ADDRESS
          </div>
          <div className="w-8 md:w-16 border-t border-dashed border-[#94A3B8]"></div>
          <div 
            onClick={() => setCheckoutStep?.('payment')}
            className={`text-[12px] md:text-[14px] font-bold tracking-[2px] pb-1 cursor-pointer transition-colors hover:text-[#0052FF] ${checkoutStep === 'payment' ? 'text-[#0052FF] border-b-2 border-[#0052FF]' : 'text-[#64748B]'}`}
          >
            PAYMENT
          </div>
        </div>

        {/* Secure Badge */}
        <div className="flex items-center gap-1.5 md:w-32 justify-end">
          <VerifiedUserIcon className="text-[#10B981]" sx={{ fontSize: 28 }} />
          <span className="text-[12px] font-extrabold tracking-[1px] text-[#10B981] flex flex-col leading-tight">
            <span>100%</span>
            <span>SECURE</span>
          </span>
        </div>

      </div>
    </section>
  );
};

export default CartHero;
