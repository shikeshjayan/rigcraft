import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

const LogoItem = ({ brand }) => {
  const monogram = (brand.name || 'BR').slice(0, 2).toUpperCase();

  return (
    <Link
      to={`/components?brandId=${brand._id}`}
      aria-label={`Browse ${brand.name} products`}
      title={brand.name}
      className="group flex items-center justify-center h-16 min-w-[140px] px-4 cursor-pointer"
    >
      {brand.logo?.url ? (
        <img
          src={brand.logo.url}
          alt={brand.logo.alt || brand.name}
          loading="lazy"
          className="max-h-full max-w-[140px] object-contain transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <span className="text-[20px] font-[800] tracking-widest text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors duration-300">
          {monogram}
        </span>
      )}
    </Link>
  );
};

const HeroBrands = () => {
  const [isHovering, setIsHovering] = useState(false);
  const { data: brandsData, isLoading, isError } = useQuery({
    queryKey: ['allBrands'],
    queryFn: async () => {
      const res = await apiClient.get('/brands', { params: { isActive: 'true' } });
      return res.data;
    }
  });

  const brands = (Array.isArray(brandsData?.data)
    ? brandsData.data
    : Array.isArray(brandsData)
      ? brandsData
      : [])
    .filter((b) => b && b.name);

  if (isLoading) {
    return (
      <section className="w-full bg-[var(--color-bg-primary)] py-16 px-4 lg:px-8 border-b border-[var(--color-border)] overflow-hidden">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="animate-pulse h-8 w-64 bg-[var(--color-bg-tertiary)] rounded mx-auto mb-10"></div>
          <div className="flex justify-center gap-8 overflow-hidden">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="w-32 h-16 bg-[var(--color-bg-tertiary)] animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || brands.length === 0) return null;

  const marqueeBrands = [...brands, ...brands];

  return (
    <section className="w-full bg-[var(--color-bg-primary)] py-16 px-4 lg:px-8 border-b border-[var(--color-border)] overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-[28px] lg:text-[36px] font-[800] text-[var(--color-text)] mb-4 tracking-tight leading-tight">
            Premium Partners
          </h2>
          <p className="text-[16px] text-[var(--color-text-secondary)] font-medium max-w-2xl mx-auto">
            We collaborate with the world's leading technology brands to bring you uncompromised performance and reliability.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 z-10 bg-gradient-to-r from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 z-10 bg-gradient-to-l from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent pointer-events-none"></div>

        <style>{`
          @keyframes hero-logo-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div
          className="flex items-center gap-8"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{ animation: 'hero-logo-marquee 45s linear infinite', width: 'max-content', animationPlayState: isHovering ? 'paused' : 'running' }}
        >
          {marqueeBrands.map((brand, index) => (
            <LogoItem key={`${brand._id || brand.name}-${index}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBrands;
