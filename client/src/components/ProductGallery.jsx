import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';

const ProductGallery = ({ images, title, onActiveChange, fill }) => {
  const safeImages = images && images.length > 0 ? images : ['/fallback.png'];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);

  const goTo = useCallback((index) => {
    const next = (index + safeImages.length) % safeImages.length;
    if (next !== activeIndex) {
      setActiveIndex(next);
      if (typeof onActiveChange === 'function') {
        onActiveChange(next);
      }
    }
  }, [safeImages.length, activeIndex, onActiveChange]);

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        goTo(activeIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        goTo(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxOpen, activeIndex, goTo]);

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-3 lg:gap-4 mb-10">
        {/* Thumbnails */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible hide-scrollbar lg:pr-1">
          {safeImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1} of ${safeImages.length}`}
              className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white border rounded-sm flex items-center justify-center p-2 overflow-hidden transition-colors ${
                i === activeIndex ? 'border-[#0047AB] ring-1 ring-[#0047AB]' : 'border-[#D5D9D9] hover:border-[#0047AB]'
              }`}
            >
              <img src={img} alt={`${title} thumbnail ${i + 1}`} className="max-h-full max-w-full object-contain" />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div className="relative flex-1 bg-[#E5E7EB] rounded-sm overflow-hidden group">
          <button
            type="button"
            onClick={openLightbox}
            aria-label="View images full screen"
            className={`w-full flex items-center justify-center overflow-hidden cursor-zoom-in ${fill ? 'h-full' : 'aspect-[4/3]'}`}
          >
            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              src={safeImages[activeIndex]}
              alt={title}
              id="main-product-image"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </button>

          {/* Photo count badge */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-[#0F1111]/70 text-white text-[11px] font-bold px-2 py-1 rounded-sm">
              {activeIndex + 1} / {safeImages.length}
            </div>
          )}

          {/* Prev / Next over main image */}
          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1); }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow-sm flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeftIcon sx={{ fontSize: 20, color: '#0F1111' }} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1); }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow-sm flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRightIcon sx={{ fontSize: 20, color: '#0F1111' }} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {createPortal(
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] bg-[#0F1111]/95 flex flex-col items-center justify-center"
              onClick={closeLightbox}
              role="dialog"
              aria-modal="true"
              aria-label="Image viewer"
            >
              <div className="absolute top-4 left-4 text-white text-sm font-medium">
                {activeIndex + 1} / {safeImages.length}
              </div>

              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close viewer"
                className="absolute top-3 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <CloseIcon sx={{ fontSize: 30, color: 'white' }} />
              </button>

              {safeImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1); }}
                    aria-label="Previous image"
                    className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeftIcon sx={{ fontSize: 36, color: 'white' }} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1); }}
                    aria-label="Next image"
                    className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ChevronRightIcon sx={{ fontSize: 36, color: 'white' }} />
                  </button>
                </>
              )}

              <motion.img
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={safeImages[activeIndex]}
                alt={title}
                onClick={(e) => e.stopPropagation()}
                drag={safeImages.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragStart={(e, info) => { touchStartX.current = info.offset.x; }}
                onDragEnd={(e, info) => {
                  if (touchStartX.current === null) return;
                  if (info.offset.x > 80) goTo(activeIndex - 1);
                  else if (info.offset.x < -80) goTo(activeIndex + 1);
                  touchStartX.current = null;
                }}
                className="max-w-[92vw] max-h-[78vh] object-contain select-none cursor-grab active:cursor-grabbing"
              />

              {/* Thumbnail strip in lightbox */}
              {safeImages.length > 1 && (
                <div className="absolute bottom-5 flex gap-2 max-w-[92vw] overflow-x-auto hide-scrollbar px-4">
                  {safeImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); goTo(i); }}
                      aria-label={`View image ${i + 1}`}
                      className={`shrink-0 w-14 h-14 bg-white rounded-sm flex items-center justify-center p-1 overflow-hidden transition-opacity ${
                        i === activeIndex ? 'opacity-100 ring-2 ring-[#0047AB]' : 'opacity-50 hover:opacity-100'
                      }`}
                    >
              <img src={img} alt={`${title} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ProductGallery;
