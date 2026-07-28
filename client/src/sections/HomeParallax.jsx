import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';

const TOTAL_FRAMES = 49

const HomeParallax = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1);

  // Framer motion scroll setup
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Map progress (0-1) to frame index. 
  // 0% -> Frame 0 (Assembled)
  // 50% -> Frame 50 (Exploded)
  // 100% -> Frame 100 (Reassembled)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  // Preload images
  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(6, '0');
      img.src = `/hero-scroll/frame_${paddedIndex}.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setImagesLoaded(true);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  const drawImage = (index) => {
    if (images.length === 0 || !canvasRef.current) return;
    const img = images[index];
    if (img && img.complete) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const scale = Math.max(width / img.width, height / img.height);
      const x = (width / 2) - (img.width / 2) * scale;
      const y = (height / 2) - (img.height / 2) * scale;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  };

  // Update canvas on scroll
  useMotionValueEvent(frameIndex, 'change', (latest) => {
    const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(latest)));
    drawImage(index);
  });

  // Update text overlays to never overlap. mode="wait" in AnimatePresence handles the clean fade outs.
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest < 0.15) setActiveIndex(1);
    else if (latest >= 0.25 && latest < 0.45) setActiveIndex(2);
    else if (latest >= 0.55 && latest < 0.75) setActiveIndex(3);
    else if (latest >= 0.85) setActiveIndex(4);
    else setActiveIndex(0); // Gaps between animations so old one fades completely
  });

  // Handle window resize for canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        if (imagesLoaded) {
          const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(frameIndex.get())));
          drawImage(index);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded, frameIndex]);

  return (
    <section ref={containerRef} className="relative h-[400vh] w-full bg-black">
      <div className="sticky top-0 h-[calc(100vh-80px)] md:h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Canvas for sequence */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-0"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Overlay gradient to ensure text readability */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10 pointer-events-none" />

        {/* Text Overlays with AnimatePresence to ensure NO overlapping */}
        <div className="relative z-20 w-full max-w-[1400px] px-6 lg:px-8 mx-auto h-full flex flex-col justify-center">
          <AnimatePresence mode="wait">

            {activeIndex === 1 && (
              <motion.div
                key="overlay1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="text-center">
                  <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-wide uppercase drop-shadow-2xl">
                    Experience The <span style={{ color: 'var(--color-primary, #06B6D4)' }}>Masterpiece</span>
                  </h2>
                  <p className="mt-4 text-xl text-gray-200 drop-shadow-lg font-medium">
                    Scroll to discover what lies within
                  </p>
                </div>
              </motion.div>
            )}

            {activeIndex === 2 && (
              <motion.div
                key="overlay2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-start pointer-events-none"
              >
                <div className="max-w-xl text-left px-4 md:px-0">
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-wide drop-shadow-xl">
                    Precision Engineered
                  </h2>
                  <p className="mt-4 text-lg md:text-xl text-gray-200 drop-shadow-lg font-medium leading-relaxed">
                    Every component meticulously selected and crafted to deliver uncompromised power and stability.
                  </p>
                </div>
              </motion.div>
            )}

            {activeIndex === 3 && (
              <motion.div
                key="overlay3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-end pointer-events-none"
              >
                <div className="max-w-xl text-right px-4 md:px-0">
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-wide drop-shadow-xl">
                    Maximum Airflow
                  </h2>
                  <p className="mt-4 text-lg md:text-xl text-gray-200 drop-shadow-lg font-medium leading-relaxed">
                    Advanced cooling dynamics ensure your system stays frosty even under extreme gaming loads.
                  </p>
                </div>
              </motion.div>
            )}

            {activeIndex === 4 && (
              <motion.div
                key="overlay4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="text-center px-4 md:px-0 flex flex-col items-center">
                  <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-wide uppercase drop-shadow-2xl">
                    Ready to <span style={{ color: 'var(--color-primary, #06B6D4)' }}>Dominate?</span>
                  </h2>
                  <p className="mt-4 mb-8 text-xl text-gray-200 drop-shadow-lg font-medium max-w-2xl">
                    The ultimate rig awaits. Seamlessly reassembled for peak performance.
                  </p>
                  <button
                    className="px-6 py-2 cursor-pointer text-white font-bold text-lg uppercase tracking-wider transition-all pointer-events-auto hover:shadow-lg hover:-translate-y-1 hover:brightness-110"
                    style={{ backgroundColor: 'var(--color-primary, #06B6D4)', borderRadius: 'var(--radius-sm, 6px)' }}
                  >
                    Build PC
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HomeParallax;
