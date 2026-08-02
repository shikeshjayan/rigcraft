import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

const HeroOffer = () => {
  const { data: dealsData } = useQuery({
    queryKey: ['activeDealsHeroOffer'],
    queryFn: async () => {
      const res = await apiClient.get('/deals');
      return res.data;
    }
  });

  const activeDeal = dealsData?.data?.deals?.find(d => d.isActive) || dealsData?.deals?.find(d => d.isActive);
  const homeOffer = activeDeal?.promotion?.homeOffer;

  if (!homeOffer?.enabled) {
    return null;
  }

  return (
    <section 
      className="w-full flex flex-col items-center justify-center px-4 py-4 text-center"
      style={{ 
        minHeight: '85px', 
        backgroundColor: 'var(--color-primary)', 
        color: 'white' 
      }}
    >
      <h3 className="text-base md:text-xl font-bold tracking-wide mb-1">
        {homeOffer.title}
      </h3>
      <p className="text-xs md:text-sm font-medium tracking-wide opacity-90">
        {homeOffer.description}
      </p>
    </section>
  );
};

export default HeroOffer;
