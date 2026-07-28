import React from 'react';
import { motion } from 'framer-motion';

const FadeUp = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: delay, 
        ease: [0.25, 0.1, 0.25, 1] // Standard professional ease-out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeUp;
