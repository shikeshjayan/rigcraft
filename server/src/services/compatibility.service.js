import { COMPATIBILITY_KEYS, COMPATIBILITY_RULES } from "../constants/compatibility.constants.js";

const getCompatibilityValue = (product, key) => {
  if (!product || !product.compatibility) return undefined;
  const comp =
    product.compatibility instanceof Map
      ? product.compatibility
      : new Map(Object.entries(product.compatibility));
  return comp.get(key);
};

const checkCpuMotherboard = (cpu, motherboard) => {
  const issues = [];
  const cpuSocket = getCompatibilityValue(cpu, COMPATIBILITY_KEYS.SOCKET);
  const mbSocket = getCompatibilityValue(motherboard, COMPATIBILITY_KEYS.SOCKET);

  if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
    issues.push(
      `CPU socket (${cpuSocket}) does not match motherboard socket (${mbSocket})`
    );
  }

  return issues;
};

const checkRamMotherboard = (ram, motherboard) => {
  const issues = [];
  const ramType = getCompatibilityValue(ram, COMPATIBILITY_KEYS.MEMORY_TYPE);
  const mbType = getCompatibilityValue(motherboard, COMPATIBILITY_KEYS.MEMORY_TYPE);
  const maxMemory = getCompatibilityValue(motherboard, COMPATIBILITY_KEYS.MAX_MEMORY);
  const maxSlots = getCompatibilityValue(motherboard, COMPATIBILITY_KEYS.MAX_MEMORY_SLOTS);

  if (ramType && mbType && ramType !== mbType) {
    issues.push(
      `RAM type (${ramType}) does not match motherboard memory type (${mbType})`
    );
  }

  if (maxMemory) {
    const ramCapacity = ram.price || 0;
    if (ramCapacity > maxMemory) {
      issues.push(
        `RAM capacity exceeds motherboard maximum (${maxMemory}GB)`
      );
    }
  }

  return issues;
};

const checkGpuCabinet = (gpu, cabinet) => {
  const issues = [];
  const gpuLength = getCompatibilityValue(gpu, COMPATIBILITY_KEYS.GPU_LENGTH);
  const maxGpuLength = getCompatibilityValue(cabinet, COMPATIBILITY_KEYS.MAX_GPU_LENGTH);

  if (gpuLength && maxGpuLength && gpuLength > maxGpuLength) {
    issues.push(
      `GPU length (${gpuLength}mm) exceeds cabinet maximum GPU length (${maxGpuLength}mm)`
    );
  }

  return issues;
};

const checkCoolerCabinet = (cooler, cabinet) => {
  const issues = [];
  const coolerHeight = getCompatibilityValue(cooler, COMPATIBILITY_KEYS.COOLER_HEIGHT);
  const maxCoolerHeight = getCompatibilityValue(cabinet, COMPATIBILITY_KEYS.MAX_COOLER_HEIGHT);

  if (coolerHeight && maxCoolerHeight && coolerHeight > maxCoolerHeight) {
    issues.push(
      `Cooler height (${coolerHeight}mm) exceeds cabinet maximum cooler height (${maxCoolerHeight}mm)`
    );
  }

  return issues;
};

const checkMotherboardCabinet = (motherboard, cabinet) => {
  const issues = [];
  const mbFormFactor = getCompatibilityValue(motherboard, COMPATIBILITY_KEYS.FORM_FACTOR);
  const cabinetFormFactor = getCompatibilityValue(cabinet, COMPATIBILITY_KEYS.FORM_FACTOR);

  if (mbFormFactor && cabinetFormFactor && mbFormFactor !== cabinetFormFactor) {
    issues.push(
      `Motherboard form factor (${mbFormFactor}) may not fit cabinet form factor (${cabinetFormFactor})`
    );
  }

  return issues;
};

const checkStorageMotherboard = (storage, motherboard) => {
  const issues = [];
  const storageInterface = getCompatibilityValue(storage, COMPATIBILITY_KEYS.STORAGE_INTERFACE);
  const mbStorageInterface = getCompatibilityValue(motherboard, COMPATIBILITY_KEYS.STORAGE_INTERFACE);

  if (storageInterface && mbStorageInterface && storageInterface !== mbStorageInterface) {
    issues.push(
      `Storage interface (${storageInterface}) may not be supported by motherboard (${mbStorageInterface})`
    );
  }

  return issues;
};

const checkCpuCooler = (cpu, cooler) => {
  const issues = [];
  const cpuTdp = getCompatibilityValue(cpu, COMPATIBILITY_KEYS.TDP);
  const coolerTdp = getCompatibilityValue(cooler, COMPATIBILITY_KEYS.TDP);

  if (cpuTdp && coolerTdp && cpuTdp > coolerTdp) {
    issues.push(
      `CPU TDP (${cpuTdp}W) exceeds cooler capacity (${coolerTdp}W)`
    );
  }

  return issues;
};

const calculatePower = (components) => {
  let totalPower = 0;

  for (const component of components) {
    const tdp = getCompatibilityValue(component, COMPATIBILITY_KEYS.TDP);
    const wattage = getCompatibilityValue(component, COMPATIBILITY_KEYS.PSU_WATTAGE);
    const value = tdp || wattage || 0;
    totalPower += Number(value);
  }

  return totalPower * 1.2;
};

const calculatePrice = (components) => {
  let totalPrice = 0;
  let totalSalePrice = 0;

  for (const component of components) {
    const price = component.price || 0;
    const salePrice = component.salePrice || price;
    totalPrice += price;
    totalSalePrice += salePrice;
  }

  return { totalPrice, totalSalePrice };
};

const validateBuild = (components) => {
  const issues = [];

  const byType = {};
  for (const comp of components) {
    const type = comp.type || comp._doc?.type;
    byType[type] = comp.product || comp._doc?.product;
  }

  const cpu = byType.cpu;
  const motherboard = byType.motherboard;
  const gpu = byType.gpu;
  const ram = byType.ram;
  const storage = byType.storage;
  const psu = byType.psu;
  const cabinet = byType.cabinet;
  const cooler = byType.cooler;

  const hasRequired = ["cpu", "motherboard", "gpu", "ram", "psu", "cabinet"];
  const missing = hasRequired.filter((t) => !byType[t]);

  if (missing.length > 0) {
    return {
      status: "incomplete",
      issues: [`Missing required components: ${missing.join(", ")}`],
      missing,
    };
  }

  if (cpu && motherboard) {
    issues.push(...checkCpuMotherboard(cpu, motherboard));
  }

  if (ram && motherboard) {
    issues.push(...checkRamMotherboard(ram, motherboard));
  }

  if (gpu && cabinet) {
    issues.push(...checkGpuCabinet(gpu, cabinet));
  }

  if (cooler && cabinet) {
    issues.push(...checkCoolerCabinet(cooler, cabinet));
  }

  if (motherboard && cabinet) {
    issues.push(...checkMotherboardCabinet(motherboard, cabinet));
  }

  if (storage && motherboard) {
    if (Array.isArray(storage)) {
      for (const s of storage) {
        issues.push(...checkStorageMotherboard(s, motherboard));
      }
    } else {
      issues.push(...checkStorageMotherboard(storage, motherboard));
    }
  }

  if (cpu && cooler) {
    issues.push(...checkCpuCooler(cpu, cooler));
  }

  const status = issues.length === 0 ? "compatible" : "incompatible";

  return { status, issues, missing: [] };
};

const validate = (build) => {
  if (!build || !build.components) {
    return {
      status: "incomplete",
      issues: ["No components in build"],
      missing: [],
      totalPrice: 0,
      totalSalePrice: 0,
      estimatedPower: 0,
    };
  }

  const products = build.components
    .filter((c) => c.product && typeof c.product === "object")
    .map((c) => c.product);

  const { totalPrice, totalSalePrice } = calculatePrice(products);
  const estimatedPower = calculatePower(products);
  const { status, issues, missing } = validateBuild(build.components);

  return {
    status,
    issues,
    missing,
    totalPrice,
    totalSalePrice,
    estimatedPower: Math.round(estimatedPower),
  };
};

export {
  checkCpuMotherboard,
  checkRamMotherboard,
  checkGpuCabinet,
  checkCoolerCabinet,
  checkMotherboardCabinet,
  checkStorageMotherboard,
  checkCpuCooler,
  calculatePower,
  calculatePrice,
  validateBuild,
  validate,
};