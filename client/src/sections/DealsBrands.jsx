import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

const DealsBrands = () => {
  const { data: brandsData, isLoading } = useQuery({
    queryKey: ['allBrands'],
    queryFn: async () => {
      const res = await apiClient.get('/brands');
      return res.data;
    },
  });

  const brands = Array.isArray(brandsData?.data)
    ? brandsData.data
    : Array.isArray(brandsData)
      ? brandsData
      : [];

  if (isLoading || brands.length === 0) return null;

  return (
    <section className="w-full py-16 border-t border-[var(--color-border)] overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="flex items-center gap-16 whitespace-nowrap animate-marquee">
        {[...brands, ...brands, ...brands].map((brand, i) => (
          <div key={`${brand._id || brand.name}-${i}`} className="text-[28px] md:text-[42px] font-extrabold text-[#CBD5E1] tracking-widest uppercase hover:text-[var(--color-primary)] transition-colors duration-300 cursor-default">
            {brand.name}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}} />
    </section>
  );
};

export default DealsBrands;
