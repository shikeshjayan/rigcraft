import { useState } from 'react';

const useAttemptTracker = (maxAttempts = 5, lockoutMinutes = 15) => {
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState(0);

  const incrementAttempt = () => {
    setAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= maxAttempts) {
        const lockoutEnd = Date.now() + lockoutMinutes * 60 * 1000;
        setIsLockedOut(true);
        setLockoutEndTime(lockoutEnd);
        return newAttempts;
      }
      return newAttempts;
    });
  };

  const resetAttempts = () => {
    setAttempts(0);
    setIsLockedOut(false);
    setLockoutEndTime(0);
  };

  const getLockoutStatus = () => {
    if (!isLockedOut) return { isLocked: false, remainingTime: 0 };

    const remainingMs = lockoutEndTime - Date.now();
    if (remainingMs <= 0) {
      resetAttempts();
      return { isLocked: false, remainingTime: 0 };
    }

    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return { isLocked: true, remainingTime: remainingMinutes };
  };

  return {
    attempts,
    isLockedOut,
    lockoutEndTime,
    incrementAttempt,
    resetAttempts,
    getLockoutStatus
  };
};

export default useAttemptTracker;