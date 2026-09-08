import { useEffect, useState } from 'react';

const useOtpTimer = (cooldownSeconds = 60) => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  useEffect(() => {
    if (isCoolingDown && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsCoolingDown(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCoolingDown, remainingTime]);

  const startCooldown = () => {
    setIsCoolingDown(true);
    setRemainingTime(cooldownSeconds);
    setLastRequestTime(Date.now());
  };

  const resetCooldown = () => {
    setIsCoolingDown(false);
    setRemainingTime(0);
    setLastRequestTime(0);
  };

  const getCooldownStatus = () => {
    if (!isCoolingDown) return { canRequest: true, message: '' };
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const timeString = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
    return {
      canRequest: false,
      message: `Please wait ${timeString} before requesting a new OTP`
    };
  };

  return {
    remainingTime,
    isCoolingDown,
    startCooldown,
    resetCooldown,
    getCooldownStatus,
    lastRequestTime
  };
};

export default useOtpTimer;