import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import apiClient from '../api/client';
const DealsHero = () => {
  const { data: dealsData } = useQuery({
    queryKey: ['activeDeals'],
    queryFn: async () => {
      const res = await apiClient.get('/deals');
      return res.data;
    }
  });

  const activeDeal = dealsData?.data?.deals?.find(d => d.isActive) || dealsData?.deals?.find(d => d.isActive);
  const title = activeDeal?.title || "MEGA TECH DEALS";
  const description = activeDeal?.description || "Up to 30% off on top brands — RTX, Ryzen, Intel, Corsair & more";

  const titleWords = title.split(' ');
  const lastWord = titleWords.pop();
  const firstPart = titleWords.join(' ');

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!activeDeal?.endDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(activeDeal.endDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [activeDeal?.endDate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <section className="w-full py-24 flex flex-col items-center text-center px-4 overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>

      <motion.div 
        className="relative z-10 flex flex-col items-center w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="border border-[#CBD5E1] rounded-full px-4 py-1.5 mb-8 flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
          <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Flash Sale — Limited Time Only</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-[52px] sm:text-[64px] md:text-[88px] font-extrabold text-[#0F172A] leading-[1.1] mb-6 tracking-tight">
          {firstPart} <br className="hidden sm:block" />
          <span className="text-[var(--color-primary)] relative inline-block">
            {lastWord}
            <motion.span 
              className="absolute -bottom-2 left-0 w-full h-2 bg-[var(--color-primary)]/20"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 0.6 }}
            ></motion.span>
          </span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-[16px] sm:text-[18px] md:text-[20px] font-medium text-[#64748B] mb-16 max-w-2xl leading-relaxed">
          {description}
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex items-center gap-1 sm:gap-2 md:gap-4 text-[#0F172A] mt-4">
          {[
          { num: String(timeLeft.days).padStart(2, '0'), label: 'DAYS' },
          { num: String(timeLeft.hours).padStart(2, '0'), label: 'HOURS' },
          { num: String(timeLeft.minutes).padStart(2, '0'), label: 'MINUTES' },
          { num: String(timeLeft.seconds).padStart(2, '0'), label: 'SECONDS' }
         ].map((time, i) => (
          <React.Fragment key={time.label}>
            <div className="bg-white/70 backdrop-blur-md border border-white/60 w-14 h-16 sm:w-20 sm:h-24 md:w-28 md:h-28 flex flex-col justify-center items-center rounded-xl sm:rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="text-[20px] sm:text-[32px] md:text-[40px] font-extrabold mb-0.5 sm:mb-1 bg-clip-text text-transparent bg-gradient-to-b from-[#0F172A] to-[#334155] relative z-10 leading-none">{time.num}</span>
              <span className="text-[7px] sm:text-[10px] md:text-[11px] font-bold text-[#64748B] tracking-[1px] sm:tracking-[2px] uppercase relative z-10 leading-none">{time.label}</span>
            </div>
            {i !== 3 && <span className="text-[16px] sm:text-[20px] md:text-[24px] font-bold text-[#CBD5E1] -mt-2 sm:-mt-4 mx-0.5 sm:mx-1">:</span>}
          </React.Fragment>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DealsHero;
