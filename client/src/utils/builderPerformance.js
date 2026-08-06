/**
 * builderPerformance — heuristic performance estimator for the PC Builder.
 *
 * The catalog does not ship benchmark/FPS data, so this grades the build from
 * price tier + spec signals (GPU VRAM, CPU TDP/cores, RAM capacity, storage).
 * Scores are 0-100 and intentionally labelled "Estimated" in the UI.
 */

const GPU_TIERS = [
  { max: 15000, score: 20 },
  { max: 30000, score: 40 },
  { max: 50000, score: 60 },
  { max: 80000, score: 80 },
  { max: Infinity, score: 95 }
];

const CPU_TIERS = [
  { max: 10000, score: 20 },
  { max: 20000, score: 40 },
  { max: 30000, score: 60 },
  { max: 45000, score: 80 },
  { max: Infinity, score: 92 }
];

const priceTierScore = (priceVal, tiers) => {
  const value = Number(priceVal) || 0;
  for (const tier of tiers) {
    if (value <= tier.max) return tier.score;
  }
  return 20;
};

const firstNumberIn = (text) => {
  const match = String(text || '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

// Finds the first spec entry matching a pattern and returns its leading number.
const specOf = (product, pattern) => {
  const specs = product?.specs;
  if (!Array.isArray(specs)) return null;
  for (const spec of specs) {
    const s = String(spec || '');
    if (pattern.test(s)) {
      return firstNumberIn(s);
    }
  }
  return null;
};

const capacityGb = (entries) => {
  if (!Array.isArray(entries) || entries.length === 0) return 0;
  let total = 0;
  for (const entry of entries) {
    const item = entry?.item;
    const qty = Math.max(1, Number(entry?.quantity) || 1);
    const gb = specOf(item, /(\d+)\s*gb/i) || specOf(item, /capacity/i);
    total += (gb || 0) * qty;
  }
  return total;
};

const gpuScore = (gpu) => {
  if (!gpu) return 0;
  let score = priceTierScore(gpu.priceVal, GPU_TIERS);
  const vram = specOf(gpu, /vram/i);
  if (vram) {
    const vramScore =
      vram >= 24 ? 95 : vram >= 16 ? 85 : vram >= 12 ? 70 : vram >= 8 ? 55 : vram >= 4 ? 40 : 25;
    score = Math.round(score * 0.7 + vramScore * 0.3);
  }
  return score;
};

const cpuScore = (cpu) => {
  if (!cpu) return 0;
  let score = priceTierScore(cpu.priceVal, CPU_TIERS);
  const tdp = Number(cpu.compatibility?.tdp);
  if (Number.isFinite(tdp) && tdp > 0) {
    const tdpScore = tdp >= 150 ? 85 : tdp >= 100 ? 70 : tdp >= 65 ? 55 : 35;
    score = Math.round(score * 0.6 + tdpScore * 0.4);
  }
  return score;
};

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

export const gradeLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Great';
  if (score >= 50) return 'Good';
  if (score >= 35) return 'Fair';
  return 'Poor';
};

export const GRADE_COLORS = {
  Excellent: '#137333',
  Great: '#1D4ED8',
  Good: '#B45309',
  Fair: '#92400E',
  Poor: '#991B1B'
};

/**
 * estimatePerformance(parts) -> { ready, gaming, productivity, overall }
 * gaming: { 1080p, 1440p, 4K } as { score, label }
 * productivity: { score, label }
 */
export const estimatePerformance = (parts) => {
  const ramEntries = Array.isArray(parts?.ram) ? parts.ram : (parts?.ram ? [{ item: parts.ram, quantity: 1 }] : []);
  const storageEntries = Array.isArray(parts?.ssd) ? parts.ssd : (parts?.ssd ? [{ item: parts.ssd, quantity: 1 }] : []);

  const gpu = gpuScore(parts?.gpu);
  const cpu = cpuScore(parts?.cpu);
  const ram = clamp(capacityGb(ramEntries) / 4 * 6); // ~4GB per 6 points, capped at 100
  const storage = clamp(capacityGb(storageEntries) / 64 * 8); // ~64GB per 8 points, capped

  const ready = Boolean(parts?.cpu) && ramEntries.length > 0 && (Boolean(parts?.gpu) || Boolean(parts?.cpu));

  const gamingScore = clamp(gpu * 0.7 + cpu * 0.2 + ram * 0.1);
  const productivityScore = clamp(cpu * 0.5 + ram * 0.3 + storage * 0.2);

  return {
    ready,
    gaming: {
      '1080p': { score: gamingScore, label: gradeLabel(gamingScore) },
      '1440p': { score: clamp(gamingScore * 0.85), label: gradeLabel(clamp(gamingScore * 0.85)) },
      '4K': { score: clamp(gamingScore * 0.65), label: gradeLabel(clamp(gamingScore * 0.65)) }
    },
    productivity: { score: productivityScore, label: gradeLabel(productivityScore) },
    overall: clamp(Math.round(gamingScore * 0.6 + productivityScore * 0.4))
  };
};
