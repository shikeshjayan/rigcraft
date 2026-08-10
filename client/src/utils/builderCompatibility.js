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
    const storageUnits = totalCount(byType.storage);
    const storageSlots = numberValue(getCompatibilityValue(byType.motherboard, 'storageSlots'));
    if (storageSlots && storageUnits > storageSlots) {
      issues.push(`Selected ${storageUnits} storage drives exceed the motherboard's ${storageSlots} storage slots.`);
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

const checkRow = (id, label, status, message) => ({ id, label, status, message });

const sameValue = (a, b) => {
  if (a == null || b == null) return null;
  return String(a).toLowerCase() === String(b).toLowerCase();
};

/**
 * validateBuilderBuildDetailed — per-check compatibility report used by the
 * builder's live "Compatibility" section. Mirrors the checks in
 * validateBuilderBuild but returns one row per pairing so the UI can render
 * individual pass / fail / pending rows.
 */
export const validateBuilderBuildDetailed = (parts) => {
  const ramEntries = normalizeEntries(parts?.ram);
  const storageEntries = normalizeEntries(parts?.ssd);

  const byType = {
    cpu: parts?.cpu || null,
    motherboard: parts?.motherboard || null,
    gpu: parts?.gpu || null,
    ram: ramEntries,
    psu: parts?.psu || null,
    cabinet: parts?.cabinet || null,
    storage: storageEntries,
    cooler: parts?.cooling || null
  };

  const checks = [];

  // 1. CPU socket ↔ motherboard socket
  const cpuSocket = getCompatibilityValue(byType.cpu, 'socket');
  const mbSocket = getCompatibilityValue(byType.motherboard, 'socket');
  if (!byType.cpu || !byType.motherboard) {
    checks.push(checkRow('cpu-motherboard', 'CPU ↔ Motherboard', 'pending', 'Select a CPU and motherboard to verify socket compatibility.'));
  } else {
    const match = sameValue(cpuSocket, mbSocket);
    checks.push(match === false
      ? checkRow('cpu-motherboard', 'CPU ↔ Motherboard', 'fail', `CPU socket (${cpuSocket}) does not match the motherboard socket (${mbSocket}).`)
      : checkRow('cpu-motherboard', 'CPU ↔ Motherboard', 'pass', cpuSocket && mbSocket ? `Socket ${cpuSocket} matches.` : 'Socket data not specified.'));
  }

  // 2. RAM ↔ motherboard (type, capacity, slots)
  if (ramEntries.length === 0 || !byType.motherboard) {
    checks.push(checkRow('ram-motherboard', 'RAM ↔ Motherboard', 'pending', 'Select memory and a motherboard to verify compatibility.'));
  } else {
    const ramIssues = [];
    const mbMemoryType = getCompatibilityValue(byType.motherboard, 'memoryType');
    for (const entry of byType.ram) {
      const ramType = getCompatibilityValue(entry.item, 'memoryType');
      if (ramType && mbMemoryType && !sameValue(ramType, mbMemoryType)) {
        ramIssues.push(`RAM type (${ramType}) does not match the motherboard memory type (${mbMemoryType}).`);
      }
    }
    const ramQty = totalCount(byType.ram);
    const totalRamCapacity = totalCapacity(byType.ram);
    const maxMemory = numberValue(getCompatibilityValue(byType.motherboard, 'maxMemory'));
    if (maxMemory && totalRamCapacity > 0 && totalRamCapacity > maxMemory) {
      ramIssues.push(`RAM capacity (${totalRamCapacity}GB across ${ramQty} sticks) exceeds the motherboard max memory (${maxMemory}GB).`);
    }
    const maxSlots = numberValue(getCompatibilityValue(byType.motherboard, 'maxMemorySlots'));
    if (maxSlots && ramQty > maxSlots) {
      ramIssues.push(`Selected ${ramQty} RAM sticks exceed the motherboard's ${maxSlots} memory slots.`);
    }
    checks.push(ramIssues.length > 0
      ? checkRow('ram-motherboard', 'RAM ↔ Motherboard', 'fail', ramIssues.join(' '))
      : checkRow('ram-motherboard', 'RAM ↔ Motherboard', 'pass', `${ramQty} stick(s), ${totalRamCapacity || 0}GB total — within motherboard limits.`));
  }

  // 3. Storage ↔ motherboard interface
  if (storageEntries.length === 0 || !byType.motherboard) {
    checks.push(checkRow('storage-motherboard', 'Storage ↔ Motherboard', 'pending', 'Select storage and a motherboard to verify compatibility.'));
  } else {
    const storageIssues = [];
    const mbStorageInterface = getCompatibilityValue(byType.motherboard, 'storageInterface');
    for (const entry of byType.storage) {
      const storageInterface = getCompatibilityValue(entry.item, 'storageInterface');
      if (storageInterface && mbStorageInterface && !sameValue(storageInterface, mbStorageInterface)) {
        storageIssues.push(`Storage interface (${storageInterface}) does not match the motherboard storage interface (${mbStorageInterface}).`);
      }
    }
    const storageUnits = totalCount(byType.storage);
    const storageSlots = numberValue(getCompatibilityValue(byType.motherboard, 'storageSlots'));
    if (storageSlots && storageUnits > storageSlots) {
      storageIssues.push(`Selected ${storageUnits} storage drives exceed the motherboard's ${storageSlots} storage slots.`);
    }
    checks.push(storageIssues.length > 0
      ? checkRow('storage-motherboard', 'Storage ↔ Motherboard', 'fail', storageIssues.join(' '))
      : checkRow('storage-motherboard', 'Storage ↔ Motherboard', 'pass', storageSlots
          ? `${storageUnits} drive(s) within the motherboard's ${storageSlots} storage slots.`
          : 'Storage interface is supported by the motherboard.'));
  }

  // 4. GPU ↔ case clearance
  if (!byType.gpu || !byType.cabinet) {
    checks.push(checkRow('gpu-case', 'GPU ↔ Case', 'pending', 'Select a GPU and case to verify clearance.'));
  } else {
    const gpuLength = numberValue(getCompatibilityValue(byType.gpu, 'gpuLength'));
    const maxGpuLength = numberValue(getCompatibilityValue(byType.cabinet, 'maxGpuLength'));
    if (gpuLength && maxGpuLength && gpuLength > maxGpuLength) {
      checks.push(checkRow('gpu-case', 'GPU ↔ Case', 'fail', `GPU length (${gpuLength}mm) exceeds the case's max GPU length (${maxGpuLength}mm).`));
    } else {
      checks.push(checkRow('gpu-case', 'GPU ↔ Case', 'pass', gpuLength && maxGpuLength ? `${gpuLength}mm GPU fits within the ${maxGpuLength}mm case limit.` : 'Clearance data not specified.'));
    }
  }

  // 5. Cooler ↔ case clearance
  if (!byType.cooler || !byType.cabinet) {
    checks.push(checkRow('cooler-case', 'Cooler ↔ Case', 'pending', 'Select a CPU cooler and case to verify clearance.'));
  } else {
    const coolerHeight = numberValue(getCompatibilityValue(byType.cooler, 'coolerHeight'));
    const maxCoolerHeight = numberValue(getCompatibilityValue(byType.cabinet, 'maxCoolerHeight'));
    if (coolerHeight && maxCoolerHeight && coolerHeight > maxCoolerHeight) {
      checks.push(checkRow('cooler-case', 'Cooler ↔ Case', 'fail', `Cooler height (${coolerHeight}mm) exceeds the case's max cooler height (${maxCoolerHeight}mm).`));
    } else {
      checks.push(checkRow('cooler-case', 'Cooler ↔ Case', 'pass', coolerHeight && maxCoolerHeight ? `${coolerHeight}mm cooler fits within the ${maxCoolerHeight}mm case limit.` : 'Clearance data not specified.'));
    }
  }

  // 6. Motherboard ↔ case form factor
  if (!byType.motherboard || !byType.cabinet) {
    checks.push(checkRow('mb-case', 'Motherboard ↔ Case', 'pending', 'Select a motherboard and case to verify form factor.'));
  } else {
    const mbFormFactor = getCompatibilityValue(byType.motherboard, 'formFactor');
    const cabinetFormFactor = getCompatibilityValue(byType.cabinet, 'formFactor');
    const match = sameValue(mbFormFactor, cabinetFormFactor);
    checks.push(match === false
      ? checkRow('mb-case', 'Motherboard ↔ Case', 'fail', `Motherboard form factor (${mbFormFactor}) does not match the case form factor (${cabinetFormFactor}).`)
      : checkRow('mb-case', 'Motherboard ↔ Case', 'pass', mbFormFactor && cabinetFormFactor ? `Form factor ${mbFormFactor} is supported.` : 'Form factor data not specified.'));
  }

  // 7. CPU ↔ cooler TDP
  if (!byType.cpu || !byType.cooler) {
    checks.push(checkRow('cpu-cooler', 'CPU ↔ Cooler', 'pending', 'Select a CPU and cooler to verify TDP rating.'));
  } else {
    const cpuTdp = numberValue(getCompatibilityValue(byType.cpu, 'tdp'));
    const coolerTdp = numberValue(getCompatibilityValue(byType.cooler, 'tdp'));
    if (cpuTdp && coolerTdp && cpuTdp > coolerTdp) {
      checks.push(checkRow('cpu-cooler', 'CPU ↔ Cooler', 'fail', `CPU TDP (${cpuTdp}W) exceeds the cooler's TDP rating (${coolerTdp}W).`));
    } else {
      checks.push(checkRow('cpu-cooler', 'CPU ↔ Cooler', 'pass', cpuTdp && coolerTdp ? `${coolerTdp}W cooler covers the ${cpuTdp}W CPU.` : 'TDP data not specified.'));
    }
  }

  // 8. PSU capacity vs estimated draw
  if (!byType.psu) {
    checks.push(checkRow('psu-capacity', 'PSU Capacity', 'pending', 'Select a power supply to verify capacity.'));
  } else {
    const psuWattage = numberValue(getCompatibilityValue(byType.psu, 'psuWattage'));
    const estDraw = estimateWattage(parts);
    if (!psuWattage) {
      checks.push(checkRow('psu-capacity', 'PSU Capacity', 'pending', 'Rated wattage not available for this PSU.'));
    } else if (psuWattage < estDraw) {
      checks.push(checkRow('psu-capacity', 'PSU Capacity', 'fail', `PSU rated ${psuWattage}W is below the estimated ${estDraw}W system draw. Consider a higher capacity PSU.`));
    } else {
      checks.push(checkRow('psu-capacity', 'PSU Capacity', 'pass', `PSU rated ${psuWattage}W covers the estimated ${estDraw}W system draw.`));
    }
  }

  const evaluated = checks.filter(c => c.status !== 'pending');
  const passed = evaluated.filter(c => c.status === 'pass').length;
  const overall = evaluated.length > 0 ? Math.round((passed / evaluated.length) * 100) : 0;

  return { checks, overall };
};
