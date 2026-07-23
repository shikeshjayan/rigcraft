import React from 'react';
import { Link } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const BuilderHero = () => {
  return (
    <section className="w-full pt-12 pb-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-[12px] text-[#64748B] font-medium mb-6">
          <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, marginX: 0.5 }} />
          <span className="text-[#0F172A] font-bold">Build PC</span>
        </div>

        {/* Header Content */}
        <div className="max-w-3xl">
          <h1 className="text-[24px] md:text-[32px] font-extrabold text-[#0F172A] mb-3 leading-tight">
            Configure Your Custom PC
          </h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed">
            Select components to start your build. We'll handle compatibility checks automatically.
          </p>
        </div>

      </div>
    </section>
  );
};

export default BuilderHero;
