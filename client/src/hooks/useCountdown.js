import { useEffect, useState } from 'react';

const useCountdown = (endDate) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const target = endDate ? new Date(endDate).getTime() : 0;
  const difference = target - now;

  const expired = difference <= 0;
  const safeDiff = Math.max(0, difference);

  return {
    days: Math.floor(safeDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((safeDiff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((safeDiff / (1000 * 60)) % 60),
    seconds: Math.floor((safeDiff / 1000) % 60),
    expired,
  };
};

export default useCountdown;
