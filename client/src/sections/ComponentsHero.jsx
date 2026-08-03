import React from 'react';
import { motion } from 'framer-motion';
import MemoryIcon from '@mui/icons-material/Memory';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import { getCategory } from '../constants/categories';

const ComponentsHero = ({ category }) => {
  if (category) {
    const details = getCategory(category) || { 
      title: decodeURIComponent(category).toUpperCase().replace('-', ' '), 
      desc: "Browse premium hardware for your custom build.", 
      icon: SettingsInputComponentIcon 
    };
    const IconComponent = details.icon || SettingsInputComponentIcon;
    
    return (
      <section className="relative w-full overflow-hidden flex items-center justify-center py-8" style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '160px' }}>
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center md:justify-start gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-primary)] shadow-sm border border-[var(--color-border)]"
          >
            <IconComponent sx={{ fontSize: 40 }} />
          </motion.div>
          <div className="text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-extrabold text-[#111111] text-[28px] md:text-[36px]"
            >
              {details.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="font-medium text-[#6B7280] text-[15px] md:text-[16px] mt-1"
            >
              {details.desc}
            </motion.p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden flex items-center justify-center py-20 lg:py-32" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Eyebrow */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[13px] md:text-[14px] font-[800] uppercase tracking-[0.2em] mb-4 text-[var(--color-primary)]"
        >
          PREMIUM HARDWARE
        </motion.p>

        {/* Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-extrabold leading-[1.15] text-[#111111] text-[36px] md:text-[52px] lg:text-[64px] mb-6 max-w-[900px]"
        >
          UPGRADE YOUR RIG.<br />
          ELEVATE YOUR <span style={{ color: 'var(--color-primary)' }}>GAME.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-medium max-w-[650px] text-[#6B7280] text-[16px] md:text-[18px] leading-relaxed mb-12"
        >
          Browse our massive collection of top-tier components. From next-gen GPUs to lightning-fast NVMe storage, find exactly what you need to build your ultimate PC.
        </motion.p>

        {/* Interactive Stats/Icons */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="p-4 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-primary)] transition-transform group-hover:scale-110 shadow-sm border border-[var(--color-border)]">
              <VideogameAssetIcon sx={{ fontSize: 32 }} />
            </div>
            <span className="font-bold text-[14px] text-[#0F1111]">GPUs</span>
          </div>
          
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="p-4 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-primary)] transition-transform group-hover:scale-110 shadow-sm border border-[var(--color-border)]">
              <MemoryIcon sx={{ fontSize: 32 }} />
            </div>
            <span className="font-bold text-[14px] text-[#0F1111]">Processors</span>
          </div>

          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="p-4 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-primary)] transition-transform group-hover:scale-110 shadow-sm border border-[var(--color-border)]">
              <DeveloperBoardIcon sx={{ fontSize: 32 }} />
            </div>
            <span className="font-bold text-[14px] text-[#0F1111]">Motherboards</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ComponentsHero;
