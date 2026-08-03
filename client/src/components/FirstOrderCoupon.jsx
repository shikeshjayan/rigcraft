import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const FirstOrderCoupon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [isEligible, setIsEligible] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Hide on specific routes
  const hideRoutes = ['/profile', '/wishlist', '/cart'];
  const shouldHide = hideRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    const checkEligibilityAndFetchCoupon = async () => {
      try {
        // Fetch active coupons
        const { data: couponData } = await apiClient.get('/coupons/active');
        if (couponData.success && couponData.data?.coupons) {
          const firstOrderCoupon = couponData.data.coupons.find(c => c.isFirstOrderOnly === true);
          if (firstOrderCoupon) {
            setCoupon(firstOrderCoupon);
          } else {
            setIsEligible(false); // No first order coupon available
            return;
          }
        } else {
            setIsEligible(false);
            return;
        }
      } catch (error) {
        console.error("Error fetching first order coupon data:", error);
      }
    };

    if (!shouldHide) {
      checkEligibilityAndFetchCoupon();
    }
  }, [isLoggedIn, shouldHide]);

  if (shouldHide || !isEligible || !coupon) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const discountText = coupon.discountType === 'percentage' 
    ? `${coupon.discountValue}% OFF` 
    : `₹${coupon.discountValue} OFF`;

  return (
    <div className="fixed top-1/2 left-0 z-50 perspective-1000">
      {/* Tab Button (Visible when closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
            onClick={() => setIsOpen(true)}
            className="absolute left-0 top-0 -translate-y-1/2 w-[52px] h-[240px] py-4 bg-[#0B1A2C] cursor-pointer flex flex-col items-center justify-center hover:bg-[#0F243E] transition-all shadow-[4px_0_15px_rgba(0,0,0,0.3)] origin-center rotate-180 border-l border-[#0EA5E9]/20"
            style={{ writingMode: 'vertical-rl' }}
          >
            <span className="font-bold text-[13px] tracking-widest uppercase text-[#94A3B8] mb-3 text-center">
              UPTO {discountText}
            </span>
            {/* Downward triangle in DOM becomes upward triangle at the top when rotated 180deg */}
            <div className="flex items-center justify-center w-full rotate-90 p-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#38BDF8">
                <path d="M12 21l-12-18h24z" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            className="absolute left-0 top-0 -translate-y-1/2 flex items-center shadow-[10px_0_30px_rgba(0,0,0,0.5)] rounded-r-2xl overflow-hidden bg-gradient-to-br from-[#0B1121] to-[#172033] border border-[#0EA5E9]/30 border-l-0 backdrop-blur-xl origin-left"
          >
             {/* Left Close Strip */}
            <div 
              onClick={() => setIsOpen(false)}
              className="bg-[#0EA5E9]/10 text-white w-10 h-full min-h-[240px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#0EA5E9]/20 transition-colors border-r border-[#0EA5E9]/20"
            >
              <ArrowLeftIcon className="text-[#38BDF8]" />
              <span 
                className="font-bold text-[11px] tracking-widest uppercase mt-4 text-[#94A3B8]" 
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                CLOSE
              </span>
            </div>

            {/* Card Content */}
            <div className="p-6 md:p-8 w-[320px] md:w-[450px] relative">
              {/* Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0EA5E9]/20 blur-3xl rounded-full" />

              <div className="absolute top-5 right-5 bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 text-[#38BDF8] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                Special Offer
              </div>

              <div className="mb-2 relative z-10">
                <span className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest">Avail Upto</span>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mt-1 drop-shadow-md">
                  {discountText}
                </h3>
              </div>

              <div className="mt-6 mb-8 relative z-10">
                <p className="text-[13px] text-[#94A3B8] font-medium mb-2">Use this Code at Checkout:</p>
                <div className="flex items-center gap-3">
                  <span className="text-[22px] font-black text-[#38BDF8] tracking-widest bg-black/40 px-5 py-2.5 rounded-lg shadow-inner border border-[#0EA5E9]/30">
                    {coupon.code}
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="p-3 bg-[#0EA5E9]/10 rounded-lg shadow-sm border border-[#0EA5E9]/30 hover:bg-[#0EA5E9]/20 transition-all text-[#38BDF8] hover:text-white group"
                    title="Copy Code"
                  >
                    <ContentCopyIcon fontSize="small" className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                {copied && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[#10B981] text-[13px] font-bold mt-3 block">✓ Copied to clipboard!</motion.span>}
                <p className="text-[12px] text-[#64748B] mt-3 italic font-medium">
                  Applicable on your very first order
                </p>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#10B981]">
                  <span className="w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">✓</span>
                  Genuine Products
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#10B981]">
                  <span className="w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">✓</span>
                  Fast Delivery
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirstOrderCoupon;
