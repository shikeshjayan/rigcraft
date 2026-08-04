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

  const [isScrolling, setIsScrolling] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleDropdownToggle = (e) => setIsDropdownOpen(e.detail.isOpen);
    window.addEventListener('mobileCategoryDropdownToggled', handleDropdownToggle);
    return () => window.removeEventListener('mobileCategoryDropdownToggled', handleDropdownToggle);
  }, []);

  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      setIsScrolling(true);
      if (isOpen) setIsOpen(false); // Auto-close when user starts scrolling
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 400); // reappear 400ms after scrolling stops
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isOpen]);

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

  if (shouldHide || !isEligible || !coupon || isDropdownOpen) {
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
        {!isOpen && !isScrolling && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
            onClick={() => setIsOpen(true)}
            className="absolute left-0 top-0 -translate-y-1/2 w-[38px] md:w-[44px] h-[160px] md:h-[240px] py-2 md:py-4 px-1 md:px-0 bg-[var(--color-primary)] cursor-pointer flex flex-col items-center justify-center hover:bg-[var(--color-primary)]/80 transition-all shadow-[4px_0_15px_rgba(0,0,0,0.15)] origin-center rotate-180 border-l border-gray-200"
            style={{ writingMode: 'vertical-rl', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }}
          >
            <span className="font-bold text-[13px] md:text-[16px] tracking-[0.1em] md:tracking-widest uppercase text-white mb-2 md:mb-3 pr-2 text-center">
              UPTO {discountText}
            </span>
            {/* Downward triangle in DOM becomes upward triangle at the top when rotated 180deg */}
            <div className="flex items-center justify-center w-full rotate-90 pb-1 md:p-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
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
            className="absolute left-0 top-0 -translate-y-1/2 flex items-center overflow-hidden bg-white border shadow-xl/30 border-gray-600 border-l-0 origin-left"
            style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
          >
             {/* Left Close Strip */}
            <div 
              onClick={() => setIsOpen(false)}
              className="bg-[var(--color-primary)] text-gray-800 w-8 md:w-10 h-full min-h-[180px] md:min-h-[240px] flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-primary)]/80 transition-colors border-r border-gray-200"
            >
              <ArrowLeftIcon className="text-white" />
              <span 
                className="font-bold text-[11px] tracking-widest uppercase mt-4 text-white" 
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                CLOSE
              </span>
            </div>

            {/* Card Content */}
            <div className="p-5 md:p-8 w-[280px] sm:w-[320px] md:w-[450px] relative">
              <div className="absolute top-3 right-3 md:top-5 md:right-5 bg-gray-100 border border-gray-200 text-gray-700 text-[9px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1 rounded-sm uppercase tracking-widest shadow-sm">
                Special Offer
              </div>

              <div className="mb-2 relative z-10">
                <span className="text-[10px] md:text-[12px] font-bold text-gray-500 uppercase tracking-widest">Avail Upto</span>
                <h3 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none mt-1 drop-shadow-sm">
                  {discountText}
                </h3>
              </div>

              <div className="mt-4 md:mt-6 mb-6 md:mb-8 relative z-10">
                <p className="text-[11px] md:text-[13px] text-gray-600 font-medium mb-2">Use this Code at Checkout:</p>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-[18px] md:text-[22px] font-black text-blue-600 tracking-widest bg-blue-50 px-4 py-2 md:px-5 md:py-2.5 rounded-sm shadow-inner border border-blue-100 flex-1 text-center md:flex-none">
                    {coupon.code}
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="p-2 md:p-3 bg-gray-100 rounded-sm shadow-sm border border-gray-200 hover:bg-gray-200 transition-all text-gray-700 hover:text-black group shrink-0"
                    title="Copy Code"
                  >
                    <ContentCopyIcon fontSize="small" className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                
                {/* Fixed position for the copied text to prevent stretching */}
                <div className="relative h-6 mt-2">
                  <AnimatePresence>
                    {copied && (
                      <motion.span 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="text-[#10B981] text-[13px] font-bold absolute left-0 top-0"
                      >
                        ✓ Copied to clipboard!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-[12px] text-[#64748B] mt-1 italic font-medium">
                  Applicable on your very first order
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 md:pt-5 border-t border-gray-200 relative z-10 flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center">
                <div className="flex items-center gap-2 text-[11px] md:text-[12px] font-bold text-[#10B981]">
                  <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[10px]">✓</span>
                  Genuine Products
                </div>
                <div className="flex items-center gap-2 text-[11px] md:text-[12px] font-bold text-[#10B981]">
                  <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[10px]">✓</span>
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
