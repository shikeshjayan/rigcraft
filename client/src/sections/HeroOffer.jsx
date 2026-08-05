import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';

const HeroOffer = () => {
  const { data: dealsData } = useQuery({
    queryKey: ['homeOffers'],
    queryFn: async () => {
      const res = await apiClient.get('/deals/promotions');
      return res.data;
    },
  });

  const deals = dealsData?.data || [];
  const offers = deals.flatMap((deal) =>
    (deal.promotion?.homeOffer || [])
      .filter((offer) => offer.enabled)
      .map((offer) => ({ ...offer, deal }))
  );

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || offers.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % offers.length);
    }, 6000);
    return () => clearInterval(id);
  }, [offers.length, isHovered]);

  if (offers.length === 0) {
    return null;
  }

  const current = offers[index % offers.length];
  const bannerUrl = current.banner?.url;

  return (
    <section
      className="w-full relative overflow-hidden"
      aria-label="Homepage offers"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-[180px] md:h-[260px]"
        >
          {bannerUrl ? (
            <div className="relative w-full h-full">
              <img
                src={bannerUrl}
                alt={current.banner?.alt || current.title || 'Offer'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/15 flex items-center">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 w-full">
                  <div className="max-w-xl text-white">
                    {current.title && (
                      <h3 className="text-xl md:text-4xl font-extrabold tracking-wide mb-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)]">
                        {current.title}
                      </h3>
                    )}
                    {current.description && (
                      <p className="text-sm md:text-lg font-medium opacity-90 mb-4 [text-shadow:0_1px_2px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)]">
                        {current.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative w-full h-full overflow-hidden flex items-center"
              style={{
                background:
                  'linear-gradient(115deg, var(--color-primary) 0%, var(--color-primary-active) 100%)',
              }}
            >
              <div
                className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-[radial-gradient(circle at 85% 20%, rgba(255,255,255,0.12) 0%, transparent 45%)]"
                aria-hidden="true"
              />
              <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 w-full">
                <div className="max-w-xl text-white">
                  <span className="inline-block mb-3 px-3 py-1 text-[11px] md:text-xs font-bold uppercase tracking-widest bg-white/15 rounded-sm">
                    Limited Offer
                  </span>
                  {current.title && (
                    <h3 className="text-xl md:text-3xl font-extrabold tracking-wide mb-2">
                      {current.title}
                    </h3>
                  )}
                  {current.description && (
                    <p className="text-sm md:text-base font-medium opacity-90">
                      {current.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default HeroOffer;
