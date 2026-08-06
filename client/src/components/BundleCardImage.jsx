import { useEffect, useRef, useState } from 'react';
import BoltIcon from '@mui/icons-material/Bolt';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const INTERVAL_MS = 3000;

const BundleCardImage = ({ bundle, thumbnails, name }) => {
  const [index, setIndex] = useState(0);
  const hoverRef = useRef(false);

  const adminImage = bundle.image?.url || null;
  const images = adminImage ? [adminImage] : thumbnails;
  const isCarousel = !adminImage && images.length > 1;
  const safeIndex = images.length > 0 ? index % images.length : 0;

  useEffect(() => {
    if (!isCarousel) return undefined;
    const id = setInterval(() => {
      if (hoverRef.current) return;
      setIndex((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [isCarousel, images.length]);

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 group-hover:bg-gray-200 transition-colors duration-300">
        <BoltIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
        <span className="text-[10px] font-bold tracking-wider">NO IMAGE</span>
      </div>
    );
  }

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const go = (e, next) => {
    stop(e);
    setIndex((next + images.length) % images.length);
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden group-hover:scale-105 transition-transform duration-500"
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${name} ${i + 1}`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === safeIndex ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {isCarousel && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => go(e, safeIndex - 1)}
            onKeyDown={(e) => e.stopPropagation()}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/85 text-[#0F172A] shadow-md hover:bg-white cursor-pointer rounded-full transition-colors z-10"
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => go(e, safeIndex + 1)}
            onKeyDown={(e) => e.stopPropagation()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/85 text-[#0F172A] shadow-md hover:bg-white cursor-pointer rounded-full transition-colors z-10"
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={(e) => go(e, i)}
                onKeyDown={(e) => e.stopPropagation()}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === safeIndex ? 'w-4 bg-[#0052FF]' : 'w-1.5 bg-white/70 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BundleCardImage;
