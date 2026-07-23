import React from 'react';
import ComputerIcon from '@mui/icons-material/Computer';

const COMMUNITY_BUILDS = [
  {
    id: 1,
    title: 'Neon Nights Dream',
    creator: '@CyberPunked',
    specs: 'I9-14900K • RTX 4090 • 64GB RAM',
    price: '$3,450'
  },
  {
    id: 2,
    title: 'Minimalist Whiteout',
    creator: '@CleanDesk',
    specs: 'RYZEN 7 7800X3D • RX 7900 XTX • 32GB RAM',
    price: '$2,100'
  },
  {
    id: 3,
    title: 'Budget Beast',
    creator: '@ValueGamer',
    specs: 'I5-13600K • RTX 4070 • 16GB RAM',
    price: '$1,250'
  }
];

const BuilderCommunity = () => {
  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">
          Get Inspired: Community Builds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMMUNITY_BUILDS.map(build => (
            <div 
              key={build.id}
              className="bg-white border border-[#CBD5E1] flex flex-col transition-shadow hover:shadow-md cursor-pointer overflow-hidden"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {/* Thumbnail Placeholder */}
              <div className="w-full aspect-[16/9] bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] border-b border-[#CBD5E1]">
                <ComputerIcon sx={{ fontSize: 48, opacity: 0.5 }} />
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-[#0F172A] text-[16px] mb-1">
                  {build.title}
                </h3>
                <p className="text-[#64748B] text-[13px] italic mb-3">
                  Built by {build.creator}
                </p>
                <p className="text-[#334155] text-[11px] font-bold uppercase tracking-wider mb-4">
                  {build.specs}
                </p>
                
                <div className="mt-auto font-bold text-[#0052FF] text-[18px]">
                  {build.price}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BuilderCommunity;
