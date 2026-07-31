import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BuildIcon from '@mui/icons-material/Build';
import HomeIcon from '@mui/icons-material/Home';

const Error = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <style>{`
        #rigcraft-chatbot { display: none !important; }
      `}</style>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
          className="mb-6 text-[var(--color-primary)]"
        >
          <BuildIcon sx={{ fontSize: 100 }} />
        </motion.div>
        
        <motion.h1 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-[120px] md:text-[180px] font-black leading-none text-gray-900 tracking-tighter"
        >
          4<span className="text-[var(--color-primary)]">0</span>4
        </motion.h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 uppercase tracking-widest mt-4 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-500 font-medium max-w-md mx-auto mb-10 text-sm md:text-base">
          Looks like you've wandered into an uncharted sector of our system. The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/" 
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white font-bold py-3.5 px-8 rounded-sm hover:bg-[var(--color-primary-hover)] transition-colors uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
        >
          <HomeIcon fontSize="small" /> Return Home
        </Link>
      </motion.div>
    </div>
  );
};

export default Error;
