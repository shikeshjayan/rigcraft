import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBuilder } from '../context/BuilderContext';
import { estimatePerformance, gradeLabel, GRADE_COLORS } from '../utils/builderPerformance';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import WorkIcon from '@mui/icons-material/Work';

const RESOLUTIONS = [
  { key: '1080p', label: '1080p', desc: 'Full HD' },
  { key: '1440p', label: '1440p', desc: 'QHD' },
  { key: '4K', label: '4K', desc: 'Ultra HD' }
];

const ScoreBar = ({ score, color }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: color }}></div>
    </div>
    <span className="w-16 text-right text-[12px] font-bold text-[#0F172A]">{score}/100</span>
  </div>
);

const BuilderPerformance = () => {
  const { selectedParts } = useBuilder();

  const estimate = useMemo(() => estimatePerformance(selectedParts), [selectedParts]);

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[24px] font-bold text-[#0F172A]">Estimated Performance</h2>
            <p className="text-[14px] text-[#64748B] mt-1">Tier-based estimate from your selected components.</p>
          </div>
          <span className="text-[12px] font-bold text-[#64748B] bg-white border border-[#CBD5E1] px-3 py-1.5 uppercase tracking-wider" style={{ borderRadius: 'var(--radius-sm)' }}>
            Estimated · Not benchmarked
          </span>
        </div>

        {!estimate.ready ? (
          <div className="bg-white border border-[#CBD5E1] p-8 text-center" style={{ borderRadius: 'var(--radius-sm)' }}>
            <div className="text-[15px] font-bold text-[#0F172A] mb-1">Performance estimate will appear as you build.</div>
            <p className="text-[13px] text-[#64748B]">Select a CPU, RAM and a GPU (or a CPU with integrated graphics) to get a gaming and productivity estimate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Gaming */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#CBD5E1] p-6"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="flex items-center gap-2 mb-5">
                <SportsEsportsIcon sx={{ fontSize: 22, color: 'var(--color-primary)' }} />
                <h3 className="text-[16px] font-bold text-[#0F172A]">Gaming</h3>
              </div>
              <div className="flex flex-col gap-4">
                {RESOLUTIONS.map(res => {
                  const item = estimate.gaming[res.key];
                  return (
                    <div key={res.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-bold text-[#334155]">{res.label}</span>
                        <span className="text-[13px] font-bold" style={{ color: GRADE_COLORS[item.label] }}>{item.label}</span>
                      </div>
                      <ScoreBar score={item.score} color={GRADE_COLORS[item.label]} />
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Productivity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-[#CBD5E1] p-6"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="flex items-center gap-2 mb-5">
                <WorkIcon sx={{ fontSize: 22, color: 'var(--color-primary)' }} />
                <h3 className="text-[16px] font-bold text-[#0F172A]">Productivity</h3>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-bold text-[#334155]">Rendering · Editing · Multitasking</span>
                    <span className="text-[13px] font-bold" style={{ color: GRADE_COLORS[estimate.productivity.label] }}>{estimate.productivity.label}</span>
                  </div>
                  <ScoreBar score={estimate.productivity.score} color={GRADE_COLORS[estimate.productivity.label]} />
                </div>
              </div>
            </motion.div>

            {/* Overall */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0F172A] p-6 flex flex-col justify-center"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Overall Score</div>
              <div className="text-[40px] font-extrabold text-white leading-none mb-1">{estimate.overall}/100</div>
              <div className="text-[15px] font-bold mb-5" style={{ color: GRADE_COLORS[gradeLabel(estimate.overall)] }}>{gradeLabel(estimate.overall)}</div>
              <div className="w-full h-2 bg-[#334155] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${estimate.overall}%`, backgroundColor: GRADE_COLORS[gradeLabel(estimate.overall)] }}></div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BuilderPerformance;
