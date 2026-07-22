import React, { useState, useEffect } from 'react';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';

const reviews = [
  {
    id: 1,
    name: 'Arjun Sharma',
    location: 'Mumbai',
    initials: 'AS',
    avatarBg: '#0284C7',
    text: "PCForge's compatibility engine saved me so much time. Built my first PC in under 30 minutes and it worked perfectly out of the box. The RTX 4090 build is an absolute beast! I couldn't be happier with the overall cable management and the pristine condition it arrived in.",
    rating: 5
  },
  {
    id: 2,
    name: 'Priya Mehta',
    location: 'Bengaluru',
    initials: 'PM',
    avatarBg: '#0284C7',
    text: "The Titan X prebuilt arrived in 4 days, perfectly packaged. The RGB lighting is stunning and the performance is incredible. Best purchase of my life!",
    rating: 5
  },
  {
    id: 3,
    name: 'Rohan Gupta',
    location: 'Delhi',
    initials: 'RG',
    avatarBg: '#0284C7',
    text: "Customer support is phenomenal. Had a question about component compatibility and the expert team resolved it within minutes. 10/10 experience. The system runs completely silent even under heavy gaming loads, which was my biggest concern.",
    rating: 5
  },
  {
    id: 4,
    name: 'Neha Verma',
    location: 'Pune',
    initials: 'NV',
    avatarBg: '#0284C7',
    text: "I was hesitant to buy a prebuilt online, but RigCraft exceeded all my expectations. The build quality is top-notch, no bloatware installed, and it booted up instantly. Highly recommend them to anyone looking for a hassle-free premium PC.",
    rating: 5
  }
];

const ReviewCard = ({ review, onReadMore }) => {
  const charLimit = 140;
  const isLong = review.text.length > charLimit;
  
  // Slice text if long, otherwise show full
  const displayText = isLong ? review.text.slice(0, charLimit) + '...' : review.text;

  return (
    <div 
      className="flex flex-col p-8 shadow-xl border border-[#F3F4F6] transition-transform hover:-translate-y-1 h-full"
      style={{ 
        backgroundColor: 'var(--color-bg-secondary, #ffffff)', 
        borderRadius: 'var(--radius-sm, 8px)' 
      }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(review.rating)].map((_, i) => (
          <StarIcon key={i} sx={{ fontSize: 20, color: '#F59E0B' }} />
        ))}
      </div>

      {/* Review Text */}
      <div className="flex-grow mb-6">
        <p className="text-[15px] text-[#4B5563] leading-relaxed font-medium">
          "{displayText}"
          {isLong && (
            <span 
              onClick={() => onReadMore(review)}
              className="text-[#2563EB] font-bold cursor-pointer ml-1 hover:underline whitespace-nowrap"
            >
              add more...
            </span>
          )}
        </p>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100">
        <div 
          className="w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-[16px] flex-shrink-0 shadow-sm"
          style={{ backgroundColor: review.avatarBg }}
        >
          {review.initials}
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-[800] text-[#111111]">
            {review.name}
          </span>
          <span className="text-[12px] font-medium text-[#6B7280]">
            {review.location} • Verified Purchase
          </span>
        </div>
      </div>
    </div>
  );
};

const HeroReview = () => {
  const [selectedReview, setSelectedReview] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedReview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedReview]);

  return (
    <section className="w-full py-20 relative" style={{ backgroundColor: 'var(--color-bg-secondary, #F9FAFB)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section (Centered format) */}
        <div className="flex flex-col justify-center items-center text-center mb-16">
          <p className="text-[13px] font-[800] uppercase tracking-[0.2em] mb-3 text-[#2563EB]">
            REVIEWS
          </p>
          <h2 className="text-[32px] md:text-[44px] font-extrabold text-[#0F172A] tracking-tight">
            What Our Customers Say
          </h2>
        </div>
        
        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onReadMore={setSelectedReview} 
            />
          ))}
        </div>

      </div>

      {/* Popup Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedReview(null)}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-lg p-8 shadow-2xl z-10 transform transition-all scale-100 opacity-100"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary, #ffffff)', 
              borderRadius: 'var(--radius-sm, 8px)' 
            }}
          >
            <button 
              onClick={() => setSelectedReview(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <CloseIcon />
            </button>
            
            <div className="flex gap-1 mb-6">
              {[...Array(selectedReview.rating)].map((_, i) => (
                <StarIcon key={i} sx={{ fontSize: 24, color: '#F59E0B' }} />
              ))}
            </div>

            <p className="text-[16px] text-[#374151] leading-relaxed font-medium mb-8">
              "{selectedReview.text}"
            </p>

            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 flex items-center justify-center rounded-full text-white font-bold text-[18px] shadow-sm"
                style={{ backgroundColor: selectedReview.avatarBg }}
              >
                {selectedReview.initials}
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-[800] text-[#111111]">
                  {selectedReview.name}
                </span>
                <span className="text-[14px] font-medium text-[#6B7280]">
                  {selectedReview.location} • Verified Purchase
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default HeroReview;
