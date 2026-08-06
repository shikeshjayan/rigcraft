import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CloseIcon from '@mui/icons-material/Close';
import apiClient from '../api/client';
import useCountdown from '../hooks/useCountdown';

const DealStickyBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: dealsData } = useQuery({
    queryKey: ['activeDeals'],
    queryFn: async () => {
      const res = await apiClient.get('/deals/promotions');
      return res.data;
    },
  });

  const deals = dealsData?.data || [];
  const soonest = deals.length
    ? deals.reduce((a, b) =>
        new Date(a.endDate).getTime() <= new Date(b.endDate).getTime() ? a : b
      )
    : null;
  const deal = soonest;

  const countdown = useCountdown(deal?.endDate);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isUrgent = countdown.days <= 1;
  const isEnding = countdown.days === 0 && countdown.hours <= 6;

  if (location.pathname === '/deals' || dismissed || !deal || countdown.expired || !visible || !isUrgent) return null;

  const handleShopDeals = () => {
    navigate('/deals', { state: { scrollToCatalog: true } });
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl animate-in slide-in-from-bottom-8 duration-300"
      role="banner"
    >
      <div
        className="flex items-center gap-3 md:gap-4 px-4 py-3 backdrop-blur shadow-2xl"
        style={{
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
        }}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          {isEnding ? (
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
          )}
          <LocalFireDepartmentIcon sx={{ fontSize: 20, color: isEnding ? '#EF4444' : '#F97316' }} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-white font-extrabold text-[13px] md:text-[14px] truncate uppercase tracking-wide">
            {deal.title || 'Mega Deal Sale'}
          </p>
          {isEnding ? (
            <p className="text-[#FCA5A5] text-[11px] md:text-[12px] font-extrabold uppercase tracking-wider">
              Ending in {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </p>
          ) : (
            <p className="text-white/70 text-[11px] md:text-[12px] font-bold tabular-nums">
              Ends in {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleShopDeals}
          className={`flex-shrink-0 text-white text-[11px] md:text-[12px] font-extrabold uppercase tracking-wide px-4 md:px-6 py-2.5 rounded-sm hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap ${
            isEnding ? 'bg-[#EF4444]' : 'bg-[var(--color-primary)]'
          }`}
        >
          {isEnding ? 'Shop Now' : 'Shop Deals'}
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss deal banner"
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-1"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
};

export default DealStickyBar;
