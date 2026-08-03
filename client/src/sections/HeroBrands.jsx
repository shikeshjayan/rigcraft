import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import apiClient from '../api/client';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const HeroBrands = () => {
  
  const { data: brandsData, isLoading, isError } = useQuery({
    queryKey: ['allBrands'],
    queryFn: async () => {
      const res = await apiClient.get('/brands');
      return res.data;
    }
  });

  const brands = brandsData?.data || brandsData || [];

  if (isLoading) {
    return (
      <div className="w-full bg-[var(--color-bg-primary)] py-16 px-4 lg:px-8 border-b border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="animate-pulse h-8 w-64 bg-gray-200 rounded mx-auto mb-10"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {Array.from({ length: 14 }).map((_, idx) => (
              <div key={idx} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || brands.length === 0) return null;

  return (
    <section className="w-full bg-[var(--color-bg-primary)] py-20 px-4 lg:px-8 border-b border-[var(--color-border)] overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[28px] lg:text-[36px] font-[800] text-[var(--color-text)] mb-4 tracking-tight leading-tight">
            Premium Partners
          </h2>
          <p className="text-[16px] text-[var(--color-text-secondary)] font-medium max-w-2xl mx-auto">
            We collaborate with the world's leading technology brands to bring you uncompromised performance and reliability.
          </p>
        </div>

        <motion.div 
          className="flex flex-wrap justify-center gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {brands.map((brand, index) => (
            <motion.div 
              key={brand._id}
              variants={itemVariants}
              className="group flex flex-col items-center justify-center p-3 bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[var(--color-primary)] transition-all duration-300 relative overflow-hidden w-[calc(50%-0.5rem)] sm:w-[calc(25%-0.75rem)] md:w-[calc(20%-0.8rem)] lg:w-[calc(14.28%-0.857rem)]"
              style={{ borderRadius: 'var(--radius-sm, 12px)' }}
              whileHover={{ y: -3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="w-full h-16 flex items-center justify-center mb-2 relative z-10">
                <img 
                  src={brand.logo?.url || '/fallback.png'} 
                  alt={brand.name} 
                  className="max-w-full max-h-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                />
              </div>
              
              <h3 className="text-[12px] font-[700] text-[var(--color-text)] text-center w-full truncate relative z-10 transition-colors duration-300 group-hover:text-[var(--color-primary)]">
                {brand.name}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBrands;
