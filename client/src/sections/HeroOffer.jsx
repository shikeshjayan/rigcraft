import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  useEffect(() => {
    if (offers.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % offers.length);
    }, 6000);
    return () => clearInterval(id);
  }, [offers.length]);

  if (offers.length === 0) {
    return null;
  }

  const current = offers[index % offers.length];
  const bannerUrl = current.banner?.url;
  const ctaLink = current.deal?.buttonLink || '/deals';
  const ctaText = current.deal?.buttonText || 'Shop Now';

  return (
    <section className="w-full relative overflow-hidden" aria-label="Homepage offers">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full min-h-[140px] md:min-h-[200px]"
        >
          {bannerUrl ? (
            <div className="relative w-full">
              <img
                src={bannerUrl}
                alt={current.banner?.alt || current.title || 'Offer'}
                className="w-full h-full max-h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 w-full">
                  <div className="max-w-xl text-white">
                    {current.title && (
                      <h3 className="text-xl md:text-4xl font-extrabold tracking-wide mb-2">
                        {current.title}
                      </h3>
                    )}
                    {current.description && (
                      <p className="text-sm md:text-lg font-medium opacity-90 mb-4">
                        {current.description}
                      </p>
                    )}
                    <Link
                      to={ctaLink}
                      className="inline-block bg-white text-[#0F172A] font-bold text-xs md:text-sm px-5 py-2.5 rounded-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
                    >
                      {ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-full flex flex-col items-center justify-center px-4 py-4 text-center"
              style={{
                minHeight: '85px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
            >
              <h3 className="text-base md:text-xl font-bold tracking-wide mb-1">
                {current.title}
              </h3>
              <p className="text-xs md:text-sm font-medium tracking-wide opacity-90">
                {current.description}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {offers.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {offers.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to offer ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-2 rounded-full transition-all cursor-pointer"
              style={{
                width: i === index ? 24 : 8,
                backgroundColor: i === index ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroOffer;
