import { motion } from 'framer-motion';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="w-full flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-16 border-t border-[var(--color-border)] pt-8"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-3 sm:px-5 py-2.5 bg-white border border-[#D5D9D9] font-bold text-[#0F1111] whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors cursor-pointer shadow-sm"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        <KeyboardArrowLeftIcon /> Previous
      </button>

      <span className="text-[13px] md:text-[15px] font-bold text-[#565959] whitespace-nowrap">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 sm:px-5 py-2.5 bg-white border border-[#D5D9D9] font-bold text-[#0F1111] whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors cursor-pointer shadow-sm"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        Next <KeyboardArrowRightIcon />
      </button>
    </motion.div>
  );
};

export default Pagination;
