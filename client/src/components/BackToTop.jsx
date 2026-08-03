import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout;
    const onScroll = () => {
      setVisible(window.scrollY > 300);
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && !isScrolling && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[var(--color-primary)] text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:opacity-90 z-50"
        >
          <ArrowUpwardIcon sx={{ fontSize: 24 }} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
