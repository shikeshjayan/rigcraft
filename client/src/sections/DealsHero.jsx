import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import apiClient from '../api/client';
import CountdownTimer from '../components/CountdownTimer';

const DealsHero = () => {
  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['activeDeals'],
    queryFn: async () => {
      const res = await apiClient.get('/deals/promotions');
      return res.data;
    },
  });

  const deals = dealsData?.data || [];
  const activeDeal = deals.find((d) => d.isFeatured) || deals[0];

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

  if (isLoading) return null;

  if (!activeDeal) {
    return (
      <section className="w-full py-24 flex flex-col items-center text-center px-4 overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>
        <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
          <div className="border border-[#CBD5E1] rounded-full px-4 py-1.5 mb-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Stay Tuned</span>
          </div>
          <h1 className="text-[40px] sm:text-[52px] md:text-[64px] font-extrabold text-[#0F172A] leading-[1.1] mb-6 tracking-tight">
            Deals <span className="text-[var(--color-primary)]">Coming Soon</span>
          </h1>
          <p className="text-[16px] sm:text-[18px] font-medium text-[#64748B] mb-10 max-w-xl leading-relaxed">
            We're cooking up exclusive offers on gaming components and prebuilt PCs. Check back soon to grab some serious savings.
          </p>
          <Link to="/products" className="inline-block bg-[var(--color-primary)] text-white font-bold text-sm px-8 py-3.5 rounded-sm uppercase tracking-wide hover:opacity-90 transition-opacity">
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  const title = activeDeal?.title || "MEGA TECH DEALS";
  const description = activeDeal?.description || "Up to 30% off on top brands — RTX, Ryzen, Intel, Corsair & more";
  const desktopBanner = activeDeal?.desktopBanner?.url;
  const mobileBanner = activeDeal?.mobileBanner?.url;
  const ctaLink = activeDeal?.buttonLink || '/deals';
  const ctaText = activeDeal?.buttonText || 'Shop Now';

  const titleWords = title.split(' ');
  const lastWord = titleWords.pop();
  const firstPart = titleWords.join(' ');

  const countdown = (
    <div className="mt-4">
      <CountdownTimer
        days={timeLeft.days}
        hours={timeLeft.hours}
        minutes={timeLeft.minutes}
        seconds={timeLeft.seconds}
        size="lg"
        showColons
      />
    </div>
  );

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

  if (desktopBanner) {
    return (
      <section className="w-full relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="relative w-full">
          <img
            src={desktopBanner}
            alt={activeDeal?.desktopBanner?.alt || title}
            className="w-full h-full max-h-[620px] object-cover hidden md:block"
          />
          <img
            src={mobileBanner || desktopBanner}
            alt={activeDeal?.mobileBanner?.alt || title}
            className="w-full h-full object-cover md:hidden"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex items-center">
            <motion.div
              className="max-w-[1500px] mx-auto px-4 lg:px-8 w-full"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants} className="border border-white/30 rounded-full px-4 py-1.5 mb-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm shadow-sm w-fit">
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
                <span className="text-[12px] font-bold text-white uppercase tracking-wider">Flash Sale — Limited Time Only</span>
              </motion.div>
              <motion.h1 variants={itemVariants} className="text-[40px] sm:text-[56px] md:text-[72px] font-extrabold text-white leading-[1.1] mb-4 tracking-tight">
                {firstPart} <span className="text-[var(--color-primary)]">{lastWord}</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-[14px] sm:text-[16px] md:text-[18px] font-medium text-white/85 mb-8 max-w-2xl leading-relaxed">
                {description}
              </motion.p>
              <motion.div variants={itemVariants}>
                {countdown}
              </motion.div>
              <motion.div variants={itemVariants} className="mt-8">
                <Link
                  to={ctaLink}
                  className="inline-block bg-white text-[#0F172A] font-bold text-xs md:text-sm px-6 py-3 rounded-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
                >
                  {ctaText}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

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

        <motion.div variants={itemVariants}>
          {countdown}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DealsHero;
