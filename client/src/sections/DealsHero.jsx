import React, { useState, useEffect } from 'react';

const DealsHero = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 27,
    seconds: 44
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
          return prev;
        }

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full py-24 flex flex-col items-center text-center px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      <div className="border border-[#CBD5E1] rounded-full px-4 py-1.5 mb-8 flex items-center gap-2 bg-white">
        <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
        <span className="text-[12px] font-bold text-[#64748B]">Flash Sale — Limited Time Only</span>
      </div>
      
      <h1 className="text-[64px] md:text-[88px] font-extrabold text-[#0F172A] leading-[1.1] mb-6 tracking-tight">
        MEGA TECH<br />
        <span className="text-[var(--color-primary)]">DEALS</span>
      </h1>
      
      <p className="text-[18px] md:text-[20px] font-bold text-[#64748B] mb-16 max-w-2xl">
        Up to 30% off on top brands — RTX, Ryzen, Intel, Corsair & more
      </p>
      
      <div className="flex items-center gap-3 md:gap-6 text-[#0F172A]">
        {[
          { num: String(timeLeft.days).padStart(2, '0'), label: 'DAYS' },
          { num: String(timeLeft.hours).padStart(2, '0'), label: 'HOURS' },
          { num: String(timeLeft.minutes).padStart(2, '0'), label: 'MINUTES' },
          { num: String(timeLeft.seconds).padStart(2, '0'), label: 'SECONDS' }
        ].map((time, i) => (
          <React.Fragment key={time.label}>
            <div className="bg-white border border-[#E2E8F0] w-20 h-24 md:w-28 md:h-32 flex flex-col justify-center items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <span className="text-[32px] md:text-[44px] font-extrabold mb-1">{time.num}</span>
              <span className="text-[10px] md:text-[11px] font-bold text-[#94A3B8] tracking-[2px] uppercase">{time.label}</span>
            </div>
            {i !== 3 && <span className="text-[20px] md:text-[24px] font-bold text-[#CBD5E1] -mt-4">:</span>}
          </React.Fragment>
        ))}
      </div>
      
    </section>
  );
};

export default DealsHero;
