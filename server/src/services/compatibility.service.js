import { COMPATIBILITY_KEYS, COMPATIBILITY_RULES } from "../constants/compatibility.constants.js";

const getCompatibilityValue = (product, key) => {
  if (!product || !product.compatibility) return undefined;
  const comp =
    product.compatibility instanceof Map
      ? product.compatibility
      : new Map(Object.entries(product.compatibility));
  return comp.get(key);
};

const hasIntegratedGraphics = (product) => {
  if (!product || !product.specifications) return false;
  const specs =
    product.specifications instanceof Map
      ? product.specifications
      : new Map(Object.entries(product.specifications));
  const value = String(specs.get("integrated_graphics") ?? "").trim().toLowerCase();
  if (!value) return false;
  const noneList = [
    "none",
    "no",
    "n/a",
    "na",
    "-",
    "nil",
    "no igpu",
    "not applicable",
    "no igpu present",
  ];
  return !noneList.includes(value);
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
  const mbType = getCompatibilityValue(motherboard, COMPATIBILITY_KEYS.MEMORY_TYPE);
  const maxMemory = getCompatibilityValue(motherboard, COMPATIBILITY_KEYS.MAX_MEMORY);
  const maxSlots = getCompatibilityValue(motherboard, COMPATIBILITY_KEYS.MAX_MEMORY_SLOTS);

  const entries = Array.isArray(ram)
    ? ram
    : [{ product: ram, quantity: 1 }];

  for (const entry of entries) {
    const ramType = getCompatibilityValue(entry.product, COMPATIBILITY_KEYS.MEMORY_TYPE);
    if (ramType && mbType && ramType !== mbType) {
      issues.push(
        `RAM type (${ramType}) does not match motherboard memory type (${mbType})`
      );
    }
  }

  let totalSticks = 0;
  let totalCapacity = 0;
  for (const entry of entries) {
    const qty = entry.quantity || 1;
    totalSticks += qty;
    totalCapacity += (entry.product.price || 0) * qty;
  }

  if (maxMemory && totalCapacity > maxMemory) {
    issues.push(
      `RAM capacity exceeds motherboard maximum (${maxMemory}GB)`
    );
  }

  if (maxSlots && totalSticks > maxSlots) {
    issues.push(
      `Selected ${totalSticks} RAM sticks exceed motherboard memory slots (${maxSlots})`
    );
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
    const product = component.product || component;
    const qty = component.quantity || 1;
    const tdp = getCompatibilityValue(product, COMPATIBILITY_KEYS.TDP);
    const wattage = getCompatibilityValue(product, COMPATIBILITY_KEYS.PSU_WATTAGE);
    const value = tdp || wattage || 0;
    totalPower += Number(value) * qty;
  }

  return totalPower * 1.2;
};

const calculatePrice = (components) => {
  let totalPrice = 0;
  let totalSalePrice = 0;

  for (const component of components) {
    const product = component.product || component;
    const qty = component.quantity || 1;
    const price = product.price || 0;
    const salePrice = product.salePrice || price;
    totalPrice += price * qty;
    totalSalePrice += salePrice * qty;
  }

  return { totalPrice, totalSalePrice };
};

const validateBuild = (components) => {
  const issues = [];

  const byType = {};
  const byTypeEntries = {};
  for (const comp of components) {
    const type = comp.type || comp._doc?.type;
    const product = comp.product || comp._doc?.product;
    const quantity = comp.quantity || 1;
    if (type === "ram" || type === "storage") {
      if (!byTypeEntries[type]) byTypeEntries[type] = [];
      byTypeEntries[type].push({ product, quantity });
    } else {
      byType[type] = product;
    }
  }

  const cpu = byType.cpu;
  const motherboard = byType.motherboard;
  const gpu = byType.gpu;
  const ram = byTypeEntries.ram;
  const storage = byTypeEntries.storage;
  const psu = byType.psu;
  const cabinet = byType.cabinet;
  const cooler = byType.cooler;

  const cpuNeedsGpu = !hasIntegratedGraphics(cpu);

  const hasRequired = ["cpu", "motherboard", "ram", "psu", "cabinet"];
  const missing = hasRequired.filter((t) => {
    if (t === "ram") return !ram || ram.length === 0;
    return !byType[t];
  });

  const required = [...hasRequired];
  const optional = ["gpu", "cooler"];

  if (cpuNeedsGpu) {
    if (!gpu) {
      missing.push("gpu");
      issues.push("Your selected CPU has no integrated graphics. Please add a dedicated GPU.");
    }
    if (!required.includes("gpu")) required.push("gpu");
    const gpuIdx = optional.indexOf("gpu");
    if (gpuIdx > -1) optional.splice(gpuIdx, 1);
  }

  if (gpu) {
    if (!cooler) {
      missing.push("cooler");
      issues.push("A GPU was selected. Please add a CPU cooler.");
    }
    if (!required.includes("cooler")) required.push("cooler");
    const coolerIdx = optional.indexOf("cooler");
    if (coolerIdx > -1) optional.splice(coolerIdx, 1);
  }

  if (missing.length > 0) {
    return {
      status: "incomplete",
      issues: [`Missing required components: ${missing.join(", ")}`, ...issues],
      missing,
      required,
      optional,
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
    for (const s of storage) {
      issues.push(...checkStorageMotherboard(s.product, motherboard));
    }
  }

  if (cpu && cooler) {
    issues.push(...checkCpuCooler(cpu, cooler));
  }

  const status = issues.length === 0 ? "compatible" : "incompatible";

  return { status, issues, missing: [], required, optional };
};

const validate = (build) => {
  if (!build || !build.components) {
    return {
      status: "incomplete",
      issues: ["No components in build"],
      missing: [],
      required: ["cpu", "motherboard", "ram", "psu", "cabinet"],
      optional: ["gpu", "cooler"],
      totalPrice: 0,
      totalSalePrice: 0,
      estimatedPower: 0,
    };
  }

  const components = build.components
    .filter((c) => c.product && typeof c.product === "object");

  const { totalPrice, totalSalePrice } = calculatePrice(components);
  const estimatedPower = calculatePower(components);
  const { status, issues, missing, required, optional } = validateBuild(build.components);

  return {
    status,
    issues,
    missing,
    required,
    optional,
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