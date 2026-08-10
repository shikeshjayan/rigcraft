import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBuilder } from '../context/BuilderContext';
import { validateBuilderBuildDetailed } from '../utils/builderCompatibility';

const STATUS_STYLES = {
  pass: {
    container: 'bg-[#E6F4EA] border-[#A8D5B5]',
    icon: 'bg-[#137333] text-white',
    text: 'text-[#137333]'
  },
  fail: {
    container: 'bg-[#FEE2E2] border-[#FCA5A5]',
    icon: 'bg-[#B91C1C] text-white',
    text: 'text-[#991B1B]'
  },
  pending: {
    container: 'bg-[var(--color-surface)] border-[var(--color-border)]',
    icon: 'bg-[#CBD5E1] text-[#475569]',
    text: 'text-[var(--color-text-secondary)]'
  }
};

const StatusIcon = ({ status }) => {
  if (status === 'pass') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === 'fail') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
    </svg>
  );
};

const BuilderCompatibility = () => {
  const { selectedParts, estWattage } = useBuilder();

  const report = useMemo(() => validateBuilderBuildDetailed(selectedParts), [selectedParts]);

  const counts = useMemo(() => ({
    pass: report.checks.filter(c => c.status === 'pass').length,
    fail: report.checks.filter(c => c.status === 'fail').length,
    pending: report.checks.filter(c => c.status === 'pending').length
  }), [report]);

  const hasFail = counts.fail > 0;
  const evaluated = report.checks.length - counts.pending;

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[24px] font-bold text-[var(--color-text)]">Compatibility Check</h2>
            <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Live verification of your selected components as you build.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 border text-[13px] font-bold ${hasFail ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]' : counts.pass > 0 && counts.fail === 0 && evaluated === report.checks.length ? 'bg-[#E6F4EA] border-[#A8D5B5] text-[#137333]' : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]'}`} style={{ borderRadius: 'var(--radius-sm)' }}>
              {hasFail
                ? `Incompatible — ${counts.fail} issue${counts.fail > 1 ? 's' : ''}`
                : evaluated === report.checks.length && evaluated > 0
                  ? '100% Compatible'
                  : `Checks pending — select more components`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {report.checks.map((check, i) => {
            const styles = STATUS_STYLES[check.status];
            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className={`border p-4 flex flex-col gap-2 ${styles.container}`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${styles.icon}`}>
                    <StatusIcon status={check.status} />
                  </span>
                  <span className={`text-[13px] font-bold ${styles.text}`}>{check.label}</span>
                </div>
                <p className={`text-[12px] leading-relaxed ${styles.text}`}>{check.message}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 text-[13px] font-medium text-[var(--color-text-secondary)]">
          <span>{counts.pass} passed</span>
          <span className="hidden sm:block text-[#CBD5E1]">|</span>
          <span>{counts.fail} issues</span>
          <span className="hidden sm:block text-[#CBD5E1]">|</span>
          <span>{counts.pending} pending selection</span>
          <span className="hidden sm:block text-[#CBD5E1]">|</span>
          <span>Estimated power draw: <span className="font-bold text-[var(--color-text)]">{estWattage}W</span></span>
        </div>
      </div>
    </section>
  );
};

export default BuilderCompatibility;
