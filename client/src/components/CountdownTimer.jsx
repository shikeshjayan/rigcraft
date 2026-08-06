import { Fragment } from 'react';

const CountdownTimer = ({ days, hours, minutes, seconds, size = 'sm', showDays = true, showColons = false, variant = 'dark' }) => {
  const pad = (n) => String(n).padStart(2, '0');

  const isLight = variant === 'light';

  const units = [
    { label: 'DAYS', value: pad(days), show: showDays },
    { label: 'HRS', value: pad(hours), show: true },
    { label: 'MIN', value: pad(minutes), show: true },
    { label: 'SEC', value: pad(seconds), show: true },
  ].filter((u) => u.show);

  const sizeStyles = {
    sm: { num: 'text-[18px]', label: 'text-[9px]' },
    lg: { num: 'text-[30px] sm:text-[40px] md:text-[48px]', label: 'text-[10px] sm:text-[12px] md:text-[13px]' },
  };
  const s = sizeStyles[size] || sizeStyles.sm;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
      {units.map((unit, i) => (
        <Fragment key={unit.label}>
          <div className="flex flex-col items-center leading-none">
            <span className={`font-extrabold tabular-nums ${s.num} ${isLight ? 'text-white' : 'text-[var(--color-text)]'}`}>{unit.value}</span>
            <span className={`font-bold uppercase tracking-wider mt-1 ${s.label} ${isLight ? 'text-white/70' : 'text-[var(--color-text-secondary)]'}`}>{unit.label}</span>
          </div>
          {showColons && i !== units.length - 1 && (
            <span
              className={`font-bold self-start ${isLight ? 'text-white/50' : 'text-[#CBD5E1]'} ${size === 'lg' ? 'text-[24px] sm:text-[32px] md:text-[36px] mt-1' : 'text-[16px]'}`}
            >
              :
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default CountdownTimer;
