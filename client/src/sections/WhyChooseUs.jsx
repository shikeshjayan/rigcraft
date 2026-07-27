import React from 'react';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

const features = [
  {
    id: 1,
    title: 'Compatibility Check',
    description: 'Real-time AI-powered compatibility engine ensures every component works perfectly together.',
    icon: <HandymanOutlinedIcon sx={{ fontSize: 32, color: 'var(--color-primary, #06B6D4)' }} />
  },
  {
    id: 2,
    title: 'Expert Support',
    description: 'Our certified PC building experts are available 24/7 to guide you through every step.',
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: 32, color: 'var(--color-primary, #06B6D4)' }} />
  },
  {
    id: 3,
    title: 'Free Assembly',
    description: 'Every custom build is professionally assembled, tested, and stress-tested before shipping.',
    icon: <ConstructionOutlinedIcon sx={{ fontSize: 32, color: 'var(--color-primary, #06B6D4)' }} />
  },
  {
    id: 4,
    title: 'Fast Delivery',
    description: 'Assembled PCs delivered in 3-5 business days with full tracking and insurance.',
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 32, color: 'var(--color-primary, #06B6D4)' }} />
  }
];

const WhyChooseUs = () => {
  return (
    <section className="w-full py-20" style={{ backgroundColor: 'var(--color-bg-primary, #F9FAFB)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section (Same format as HeroDeals) */}
        <div className="flex flex-col justify-center items-center text-center mb-16">
          <p className="text-[12px] font-[800] uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary, #06B6D4)' }}>
            Our Promise
          </p>
          <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#111111] uppercase tracking-wide">
            Why Choose <span style={{ color: 'var(--color-primary, #06B6D4)' }}>RigCraft</span>
          </h2>
        </div>
        
        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="flex flex-col items-center text-center px-6 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F3F4F6] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:border-[var(--color-primary)] group"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary, #ffffff)', 
                borderRadius: 'var(--radius-sm, 8px)' 
              }}
            >
              {/* Icon Wrapper */}
              <div 
                className="w-[72px] h-[72px] flex items-center justify-center mb-6"
                style={{ 
                  backgroundColor: 'rgba(6, 182, 212, 0.08)', // Faint primary color background
                  borderRadius: '16px' 
                }}
              >
                {feature.icon}
              </div>
              
              {/* Text Content */}
              <h3 className="text-[18px] font-[800] text-[#111111] mb-3">
                {feature.title}
              </h3>
              <p className="text-[14px] font-[500] text-[#6B7280] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
