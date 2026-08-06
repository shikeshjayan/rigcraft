import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RedeemIcon from '@mui/icons-material/Redeem';
import PercentIcon from '@mui/icons-material/Percent';
import ScheduleIcon from '@mui/icons-material/Schedule';
import apiClient from '../api/client';
import { bundleService } from '../services/bundle.service';

const DAY_MS = 1000 * 60 * 60 * 24;
const MOUNT_TIME = Date.now();

const StatBlock = ({ icon, value, label, highlight }) => (
  <div className="flex flex-col items-center text-center px-4 py-6 bg-white border border-[#E2E8F0] hover:shadow-md transition-shadow" style={{ borderRadius: 'var(--radius-sm)' }}>
    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${highlight ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#F0F6FF] text-[#0052FF]'}`}
    >
      {icon}
    </div>
    <span className="text-[24px] md:text-[28px] font-extrabold text-[#0F172A] leading-none">{value}</span>
    <span className="text-[11px] md:text-[12px] font-bold text-[#64748B] uppercase tracking-wider mt-1.5">{label}</span>
  </div>
);

const DealStats = () => {
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['activeDealsProducts'],
    queryFn: async () => {
      const res = await apiClient.get('/deals/active');
      return res.data;
    },
  });

  const { data: bundlesData, isLoading: bundlesLoading } = useQuery({
    queryKey: ['activeBundlesStats'],
    queryFn: () => bundleService.getActive(),
    staleTime: 60_000,
  });

  const stats = useMemo(() => {
    const dealsList = Array.isArray(dealsData?.data) ? dealsData.data : [];
    const bundlesList = Array.isArray(bundlesData?.data) ? bundlesData.data : [];

    if (dealsList.length === 0 && bundlesList.length === 0) return null;

    let maxDiscount = 0;
    let soonestEnd = null;

    dealsList.forEach((deal) => {
      const endT = deal.endDate ? new Date(deal.endDate).getTime() : 0;
      if (endT && (!soonestEnd || endT < soonestEnd)) soonestEnd = endT;

      const items = [...(deal.products || []), ...(deal.prebuiltPCs || [])];
      items.forEach((item) => {
        const isPrebuilt = Boolean(item.pricing);
        const mrp = isPrebuilt ? item.pricing?.price : item.price;
        const sale = isPrebuilt ? item.pricing?.salePrice : item.salePrice;
        if (mrp && sale && Number(mrp) > Number(sale)) {
          const pct = Math.round(((Number(mrp) - Number(sale)) / Number(mrp)) * 100);
          if (pct > maxDiscount) maxDiscount = pct;
        }
      });
    });

    bundlesList.forEach((bundle) => {
      const endT = bundle.endDate ? new Date(bundle.endDate).getTime() : 0;
      if (endT && (!soonestEnd || endT < soonestEnd)) soonestEnd = endT;

      if (bundle.discountPct && bundle.discountPct > maxDiscount) {
        maxDiscount = bundle.discountPct;
      }
    });

    const daysLeft = soonestEnd
      ? Math.max(0, Math.ceil((soonestEnd - MOUNT_TIME) / DAY_MS))
      : 0;

    return {
      activeDeals: dealsList.length,
      bundles: bundlesList.length,
      maxDiscount,
      daysLeft,
    };
  }, [dealsData, bundlesData]);

  if (dealsLoading || bundlesLoading || !stats || (stats.activeDeals === 0 && stats.bundles === 0)) return null;

  return (
    <section className="w-full py-12 border-t border-[#E2E8F0]" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          <StatBlock
            icon={<LocalOfferIcon sx={{ fontSize: 22 }} />}
            value={stats.activeDeals}
            label="Active Deals"
            highlight
          />
          <StatBlock
            icon={<RedeemIcon sx={{ fontSize: 22 }} />}
            value={stats.bundles}
            label="Bundle Offers"
          />
          <StatBlock
            icon={<PercentIcon sx={{ fontSize: 22 }} />}
            value={`${stats.maxDiscount}%`}
            label="Max Discount"
            highlight
          />
          <StatBlock
            icon={<ScheduleIcon sx={{ fontSize: 22 }} />}
            value={stats.daysLeft}
            label="Days Left"
            highlight={stats.daysLeft <= 2}
          />
        </div>
      </div>
    </section>
  );
};

export default DealStats;
