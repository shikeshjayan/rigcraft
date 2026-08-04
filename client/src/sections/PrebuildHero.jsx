import React, { useRef, useEffect, useState } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useMotionTemplate, 
  AnimatePresence 
} from 'framer-motion';

// MUI Icons
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import MemoryIcon from '@mui/icons-material/Memory';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import MouseIcon from '@mui/icons-material/Mouse';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

// ----------------------------------------------------------------------
// VARIANTS
// ----------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { 
      duration: 0.9, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const pcVariants = {
  hidden: { opacity: 0, scale: 0.92, rotateY: 8, x: 80 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotateY: 0, 
    x: 0,
    transition: { 
      type: 'spring',
      stiffness: 70,
      damping: 20,
      mass: 1.2,
      duration: 1.2,
      delay: 0.4
    }
  }
};

const FloatingComponent = ({ icon: Icon, label, delay = 0, yOffset = -12, xOffset = 0, style }) => {
  return (
    <motion.div
      className="absolute flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-md border border-[#E5E7EB] shadow-[0_8px_32px_rgba(0,0,0,0.04)] z-20 pointer-events-none"
      style={{ ...style, borderRadius: '3px' }}
      animate={{
        y: [0, yOffset, 0],
        x: [0, xOffset, 0],
        rotate: [0, 3, 0],
      }}
      transition={{
        duration: 5 + delay, // 4-7 seconds
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop"
      }}
    >
      <Icon sx={{ fontSize: 18, color: 'var(--color-primary, #9e70ff)' }} />
      <span className="text-[12px] font-bold text-[#111111]">{label}</span>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const PrebuildHero = () => {
  const sectionRef = useRef(null);

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Left Content Scroll Parallax
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  // Right PC Scroll Parallax
  const pcY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const pcScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const pcRotateY = useTransform(scrollYProgress, [0, 1], [0, 8]);
  
  // Glow & Grid Parallax
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const glowBlur = useTransform(scrollYProgress, [0, 1], [40, 100]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  // Floating parts spread on scroll
  const gpuX = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const cpuX = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const ramY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const ssdY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const mbRotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

  // Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (!sectionRef.current) return;
    const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25; // dampening factor
    const y = (e.clientY - top - height / 2) / 25;
    mouseX.set(x);
    mouseY.set(y);
  };

  const pcMouseX = useTransform(smoothMouseX, x => x * 0.5); // ±15px approx
  const pcMouseY = useTransform(smoothMouseY, y => y * 0.5);
  
  const floatingMouseX = useTransform(smoothMouseX, x => x * 1.2); // ±30px approx
  const floatingMouseY = useTransform(smoothMouseY, y => y * 1.2);

  const glowMouseX = useTransform(smoothMouseX, x => x * 1.5); // ±40px approx
  const glowMouseY = useTransform(smoothMouseY, y => y * 1.5);

  const bgMouseX = useTransform(smoothMouseX, x => x * 0.3); // ±8px approx
  const bgMouseY = useTransform(smoothMouseY, y => y * 0.3);

  return (
    <section 
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[75vh] lg:min-h-[85vh] flex items-center overflow-hidden bg-white selection:bg-[var(--color-primary)] selection:text-white"
      style={{ perspective: '1400px' }}
    >
      {/* ---------------- BACKGROUND LAYERS ---------------- */}
      
      {/* Animated Gradient Mesh */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--color-primary) 0%, transparent 50%)',
          x: bgMouseX,
          y: bgMouseY,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />


      {/* Radial Blue Glow behind PC */}
      <motion.div
        className="absolute right-[10%] top-[20%] w-[600px] h-[600px] rounded-full z-0 pointer-events-none mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 60%)',
          opacity: glowOpacity,
          filter: useMotionTemplate`blur(${glowBlur}px)`,
          x: glowMouseX,
          y: glowMouseY,
        }}
      />

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between h-full pt-24 lg:pt-0">
        
        {/* LEFT SIDE: Text Content */}
        <motion.div 
          className="w-full lg:w-[45%] flex flex-col justify-center mb-16 lg:mb-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y: textY, opacity: textOpacity, scale: textScale }}
        >
          {/* Animated Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-[#E5E7EB] bg-[#F9FAFB]/80 backdrop-blur-sm w-max"
            style={{ borderRadius: '3px' }}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-[12px] font-bold text-[#111111] tracking-wider uppercase">Next-Gen Prebuilds</span>
          </motion.div>

          {/* Large Bold Heading */}
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-[44px] md:text-[56px] lg:text-[72px] font-extrabold text-[#111111] leading-[1.05] tracking-tight">
              Ready To Play. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[#6366f1] animate-gradient-x">
                Ready To Win.
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-[16px] md:text-[18px] text-[#6B7280] font-medium leading-relaxed max-w-[500px] mb-8"
          >
            Expertly assembled, rigorously stress-tested, and optimized for maximum framerates. Shipped directly to your door with a 3-year premium warranty.
          </motion.p>

          {/* CTA Buttons */}
          {/* <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-12">
            <motion.button
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-[var(--color-primary)] text-white font-bold text-[15px] overflow-hidden shadow-[0_4px_14px_0_rgba(158,112,255,0.39)]"
              style={{ borderRadius: '3px' }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Shop Prebuilds</span>
              <KeyboardArrowRightIcon className="relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" sx={{ fontSize: 20 }} />
            </motion.button>
            
            <motion.button
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-transparent text-[#111111] font-bold text-[15px] border border-[#E5E7EB] hover:border-[var(--color-primary)] overflow-hidden transition-colors duration-300"
              style={{ borderRadius: '3px' }}
            >
              <div className="absolute inset-0 bg-[var(--color-primary)]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 group-hover:text-[var(--color-primary)] transition-colors">Build Custom</span>
            </motion.button>
          </motion.div> */}

          {/* Trust Badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 pt-6 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              <SecurityOutlinedIcon sx={{ fontSize: 20, color: 'var(--color-primary)' }} />
              <span className="text-[13px] font-bold text-[#4B5563]">3-Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <LocalShippingOutlinedIcon sx={{ fontSize: 20, color: 'var(--color-primary)' }} />
              <span className="text-[13px] font-bold text-[#4B5563]">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <VerifiedUserOutlinedIcon sx={{ fontSize: 20, color: 'var(--color-primary)' }} />
              <span className="text-[13px] font-bold text-[#4B5563]">Tested & Certified</span>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE: PC Render & Floating Components */}
        <motion.div 
          className="w-full lg:w-[50%] relative h-[400px] md:h-[600px] flex items-center justify-center transform-style-3d"
          style={{ y: pcY, scale: pcScale, rotateY: pcRotateY }}
        >
          {/* Main PC Image */}
          <motion.div 
            variants={pcVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 w-full max-w-[450px] drop-shadow-2xl"
            style={{ x: pcMouseX, y: pcMouseY }}
          >
            <img 
              src="/heroimage.png" 
              alt="Premium Gaming PC" 
              className="w-full h-auto object-contain"
            />
            {/* Image Shine Effect */}
            <motion.div 
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 mix-blend-overlay"
              style={{
                background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 25%, transparent 30%)',
                backgroundSize: '200% 100%'
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          {/* Floating Components */}
          <motion.div style={{ x: floatingMouseX, y: floatingMouseY }} className="absolute inset-0 z-20 pointer-events-none">
            
            <motion.div style={{ x: gpuX }} className="absolute top-[20%] right-[20%]">
              <FloatingComponent icon={VideogameAssetIcon} label="RTX 4090" delay={0.2} yOffset={-15} />
            </motion.div>

            <motion.div style={{ x: cpuX }} className="absolute top-[30%] left-[15%]">
              <FloatingComponent icon={MemoryIcon} label="Core i9 14th Gen" delay={0.8} yOffset={10} />
            </motion.div>

            <motion.div style={{ y: ramY }} className="absolute bottom-[30%] right-[25%]">
              <FloatingComponent icon={MemoryIcon} label="64GB DDR5" delay={1.5} yOffset={-12} xOffset={5} />
            </motion.div>

            <motion.div style={{ y: ssdY }} className="absolute bottom-[40%] left-[15%]">
              <FloatingComponent icon={StorageIcon} label="2TB NVMe Gen5" delay={0.5} yOffset={15} />
            </motion.div>

            <motion.div style={{ rotate: mbRotate }} className="absolute top-[15%] left-[25%]">
              <FloatingComponent icon={DeveloperBoardIcon} label="Z790 Premium" delay={1.1} yOffset={-8} />
            </motion.div>

            <motion.div className="absolute bottom-[15%] left-[45%]">
              <FloatingComponent icon={SettingsInputComponentIcon} label="AIO Liquid Cooler" delay={2.0} yOffset={12} />
            </motion.div>
            
          </motion.div>

        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [0.6, 0]) }}
      >
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6B7280]">Scroll</span>
        <div className="w-[20px] h-[32px] border-2 border-[#D1D5DB] rounded-full flex justify-center p-1">
          <motion.div 
            className="w-1 h-2 bg-[#9CA3AF] rounded-full"
            animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {/* Global Style for Gradient Text Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}} />
    </section>
  );
};

export default PrebuildHero;
