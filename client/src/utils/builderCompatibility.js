/**
 * builderCompatibility — client-side mirror of the server's compatibility
 * engine (server/src/services/compatibility.service.js). Reads each part's
 * `compatibility` map (serialized to a plain object by Mongoose) so the
 * builder can surface compatibility issues in real time without a round trip.
 *
 * RAM and Storage are multi-slot: parts.ram / parts.ssd hold arrays of
 * `{ item, quantity }` entries (distinct parts, each with its own quantity).
 */

import { BUILDER_CATEGORIES } from './builderProducts';

const getCompatibilityValue = (product, key) => {
  if (!product) return null;
  return product.compatibility?.[key];
};

const hasIntegratedGraphics = (product) => {
  if (!product) return false;
  const specs = product.specifications;
  if (!specs) return false;
  const value = String(specs.integrated_graphics ?? specs?.get?.('integrated_graphics') ?? '').trim().toLowerCase();
  if (!value) return false;
  const noneList = ['none', 'no', 'n/a', 'na', '-', 'nil', 'no igpu', 'not applicable', 'no igpu present'];
  return !noneList.includes(value);
};

const numberValue = (v) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const REQUIRED_COMPONENTS = ['cpu', 'motherboard', 'ram', 'psu', 'cabinet'];

// Normalizes a slot value into an array of { item, quantity } entries.
// Accepts the new array shape or a legacy single product.
const normalizeEntries = (value) => {
  if (Array.isArray(value)) {
    return value.filter((e) => e && e.item);
  }
  if (value && typeof value === 'object') {
    return [{ item: value, quantity: 1 }];
  }
  return [];
};

const totalCount = (entries) =>
  entries.reduce((sum, e) => sum + Math.max(1, Number(e.quantity) || 1), 0);

const totalCapacity = (entries) =>
  entries.reduce((sum, e) => {
    const qty = Math.max(1, Number(e.quantity) || 1);
    const capacity = numberValue(e.item.priceVal ?? e.item.price);
    return capacity != null ? sum + capacity * qty : sum;
  }, 0);

export const validateBuilderBuild = (parts) => {
  const ramEntries = normalizeEntries(parts?.ram);
  const storageEntries = normalizeEntries(parts?.ssd);

  const byType = {
    cpu: parts?.cpu || null,
    motherboard: parts?.motherboard || null,
    gpu: parts?.gpu || null,
    ram: ramEntries.length > 0 ? ramEntries : null,
    psu: parts?.psu || null,
    cabinet: parts?.cabinet || null,
    storage: storageEntries.length > 0 ? storageEntries : null,
    cooler: parts?.cooling || null
  };

  const issues = [];

  const cpuTdp = numberValue(getCompatibilityValue(byType.cpu, 'tdp'));
  const cpuNeedsGpu = !hasIntegratedGraphics(byType.cpu);

  const missing = REQUIRED_COMPONENTS.filter((type) => !byType[type]);

  const required = [...REQUIRED_COMPONENTS];
  const optional = ['gpu', 'cooler'];

  if (cpuNeedsGpu) {
    if (!byType.gpu) {
      missing.push('gpu');
      issues.push(
        'Your selected CPU has no integrated graphics. Please add a dedicated GPU.'
      );
    }
    if (!required.includes('gpu')) required.push('gpu');
    const gpuIdx = optional.indexOf('gpu');
    if (gpuIdx > -1) optional.splice(gpuIdx, 1);
  }

  if (byType.gpu) {
    if (!byType.cooler) {
      missing.push('cooler');
      issues.push('A GPU was selected. Please add a CPU cooler.');
    }
    if (!required.includes('cooler')) required.push('cooler');
    const coolerIdx = optional.indexOf('cooler');
    if (coolerIdx > -1) optional.splice(coolerIdx, 1);
  }

  if (missing.length > 0) {
    return {
      status: 'incomplete',
      issues: [`Missing required components: ${missing.join(', ')}`, ...issues],
      missing,
      required,
      optional
    };
  }

  // checkCpuMotherboard — CPU socket vs motherboard socket
  const cpuSocket = getCompatibilityValue(byType.cpu, 'socket');
  const mbSocket = getCompatibilityValue(byType.motherboard, 'socket');
  if (cpuSocket && mbSocket && String(cpuSocket).toLowerCase() !== String(mbSocket).toLowerCase()) {
    issues.push(`CPU socket (${cpuSocket}) does not match the motherboard socket (${mbSocket}).`);
  }

  // checkRamMotherboard — per-stick type, total capacity and slots vs motherboard
  const mbMemoryType = getCompatibilityValue(byType.motherboard, 'memoryType');
  for (const entry of byType.ram) {
    const ramType = getCompatibilityValue(entry.item, 'memoryType');
    if (ramType && mbMemoryType && String(ramType).toLowerCase() !== String(mbMemoryType).toLowerCase()) {
      issues.push(`RAM type (${ramType}) does not match the motherboard memory type (${mbMemoryType}).`);
    }
  }
  const ramQty = totalCount(byType.ram);
  const totalRamCapacity = totalCapacity(byType.ram);
  const maxMemory = numberValue(getCompatibilityValue(byType.motherboard, 'maxMemory'));
  if (maxMemory && totalRamCapacity > 0 && totalRamCapacity > maxMemory) {
    issues.push(`RAM capacity (${totalRamCapacity}GB across ${ramQty} sticks) exceeds the motherboard max memory (${maxMemory}GB).`);
  }
  const maxSlots = numberValue(getCompatibilityValue(byType.motherboard, 'maxMemorySlots'));
  if (maxSlots && ramQty > maxSlots) {
    issues.push(`Selected ${ramQty} RAM sticks exceed the motherboard's ${maxSlots} memory slots.`);
  }

  // checkGpuCabinet — GPU length vs cabinet max GPU length
  const gpuLength = numberValue(getCompatibilityValue(byType.gpu, 'gpuLength'));
  const maxGpuLength = numberValue(getCompatibilityValue(byType.cabinet, 'maxGpuLength'));
  if (gpuLength && maxGpuLength && gpuLength > maxGpuLength) {
    issues.push(`GPU length (${gpuLength}mm) exceeds the cabinet's max GPU length (${maxGpuLength}mm).`);
  }

  // checkCoolerCabinet — cooler height vs cabinet max cooler height
  const coolerHeight = numberValue(getCompatibilityValue(byType.cooler, 'coolerHeight'));
  const maxCoolerHeight = numberValue(getCompatibilityValue(byType.cabinet, 'maxCoolerHeight'));
  if (coolerHeight && maxCoolerHeight && coolerHeight > maxCoolerHeight) {
    issues.push(`Cooler height (${coolerHeight}mm) exceeds the cabinet's max cooler height (${maxCoolerHeight}mm).`);
  }

  // checkMotherboardCabinet — motherboard form factor vs cabinet form factor
  const mbFormFactor = getCompatibilityValue(byType.motherboard, 'formFactor');
  const cabinetFormFactor = getCompatibilityValue(byType.cabinet, 'formFactor');
  if (mbFormFactor && cabinetFormFactor && String(mbFormFactor).toLowerCase() !== String(cabinetFormFactor).toLowerCase()) {
    issues.push(`Motherboard form factor (${mbFormFactor}) does not match the cabinet form factor (${cabinetFormFactor}).`);
  }

  // checkStorageMotherboard — each drive's interface vs motherboard storage interface
  const mbStorageInterface = getCompatibilityValue(byType.motherboard, 'storageInterface');
  if (byType.storage) {
    for (const entry of byType.storage) {
      const storageInterface = getCompatibilityValue(entry.item, 'storageInterface');
      if (storageInterface && mbStorageInterface && String(storageInterface).toLowerCase() !== String(mbStorageInterface).toLowerCase()) {
        issues.push(`Storage interface (${storageInterface}) does not match the motherboard storage interface (${mbStorageInterface}).`);
      }
    }
  }

  // checkCpuCooler — CPU TDP vs cooler TDP rating
  const coolerTdp = numberValue(getCompatibilityValue(byType.cooler, 'tdp'));
  if (cpuTdp && coolerTdp && cpuTdp > coolerTdp) {
    issues.push(`CPU TDP (${cpuTdp}W) exceeds the cooler's TDP rating (${coolerTdp}W).`);
  }

  return {
    status: issues.length === 0 ? 'compatible' : 'incompatible',
    issues,
    missing,
    required,
    optional
  };
};

const DEFAULT_WATTAGE = { cpu: 105, motherboard: 40, ram: 15, ssd: 10, cooling: 15 };

export const estimateWattage = (parts) => {
  let watts = 0;
  BUILDER_CATEGORIES.forEach((key) => {
    const part = parts?.[key];
    if (!part) return;

    const wattOf = (product) => {
      const tdp = numberValue(getCompatibilityValue(product, 'tdp'));
      const psuWattage = numberValue(getCompatibilityValue(product, 'psuWattage'));
      return tdp ?? psuWattage ?? (DEFAULT_WATTAGE[key] || 0);
    };

    if (key === 'ram' || key === 'ssd') {
      normalizeEntries(part).forEach((entry) => {
        watts += wattOf(entry.item) * Math.max(1, Number(entry.quantity) || 1);
      });
    } else {
      watts += wattOf(part);
    }
  });
  return Math.round(watts * 1.2);
};
