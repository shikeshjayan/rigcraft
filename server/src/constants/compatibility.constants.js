export const COMPATIBILITY_KEYS = {
  SOCKET: "socket",
  FORM_FACTOR: "formFactor",
  MEMORY_TYPE: "memoryType",
  MAX_MEMORY: "maxMemory",
  MAX_MEMORY_SLOTS: "maxMemorySlots",
  TDP: "tdp",
  PSU_WATTAGE: "psuWattage",
  GPU_LENGTH: "gpuLength",
  COOLER_HEIGHT: "coolerHeight",
  STORAGE_INTERFACE: "storageInterface",
  STORAGE_FORM_FACTOR: "storageFormFactor",
  PCIE_VERSION: "pcieVersion",
  CPU_SERIES: "cpuSeries",
  CHIPSET: "chipset",
  MEMORY_CHANNELS: "memoryChannels",
  GRAPHICS_OUTPUT: "graphicsOutput",
  ETHERNET: "ethernet",
  AUDIO: "audio",
  USB_PORTS: "usbPorts",
  FAN_HEADERS: "fanHeaders",
  RGB_HEADERS: "rgbHeaders",
  MAX_GPU_LENGTH: "maxGpuLength",
  MAX_COOLER_HEIGHT: "maxCoolerHeight",
  MAX_PSU_LENGTH: "maxPsuLength",
  RADIATOR_SUPPORT: "radiatorSupport",
  INCLUDED_FANS: "includedFans",
};

export const BUILD_STATUS = {
  INCOMPLETE: "incomplete",
  COMPATIBLE: "compatible",
  INCOMPATIBLE: "incompatible",
};

export const REQUIRED_COMPONENT_TYPES = [
  "cpu",
  "motherboard",
  "gpu",
  "ram",
  "psu",
  "cabinet",
];

export const COMPATIBILITY_RULES = {
  CPU_MOTHERBOARD_SOCKET: "cpu_motherboard_socket",
  RAM_MOTHERBOARD_TYPE: "ram_motherboard_type",
  RAM_MOTHERBOARD_CAPACITY: "ram_motherboard_capacity",
  GPU_CABINET_LENGTH: "gpu_cabinet_length",
  COOLER_CABINET_HEIGHT: "cooler_cabinet_height",
  PSU_WATTAGE: "psu_wattage",
  MOTHERBOARD_CABINET_FORM_FACTOR: "motherboard_cabinet_form_factor",
  STORAGE_MOTHERBOARD_INTERFACE: "storage_motherboard_interface",
  CPU_COOLER_TDP: "cpu_cooler_tdp",
};