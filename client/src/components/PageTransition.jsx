import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1], // Standard professional ease-out
      staggerChildren: 0.05,
    },
    transitionEnd: {
      transform: 'none',
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
