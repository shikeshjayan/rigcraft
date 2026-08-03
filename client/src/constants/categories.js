import MemoryIcon from '@mui/icons-material/Memory';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import SaveIcon from '@mui/icons-material/Save';
import BoltIcon from '@mui/icons-material/Bolt';
import ComputerIcon from '@mui/icons-material/Computer';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import MouseIcon from '@mui/icons-material/Mouse';
import MonitorIcon from '@mui/icons-material/Monitor';
import DnsIcon from '@mui/icons-material/Dns';

export const CATEGORIES = [
  { slug: 'cpu', label: 'CPU', title: 'PROCESSORS (CPUs)', desc: 'Intel & AMD Processors', categoryType: 'processor', icon: MemoryIcon, color: '#8B5CF6' },
  { slug: 'gpu', label: 'GPU', title: 'GRAPHICS CARDS', desc: 'NVIDIA & AMD Cards', categoryType: 'graphics_card', icon: VideogameAssetIcon, color: '#3B82F6' },
  { slug: 'motherboard', label: 'Motherboard', title: 'MOTHERBOARDS', desc: 'ATX, mATX, ITX', categoryType: 'motherboard', icon: DeveloperBoardIcon, color: '#10B981' },
  { slug: 'ram', label: 'RAM', title: 'MEMORY (RAM)', desc: 'DDR4 & DDR5 Memory', categoryType: 'memory', icon: MemoryIcon, color: '#F43F5E' },
  { slug: 'storage', label: 'SSD / Storage', title: 'STORAGE (SSDs/HDDs)', desc: 'NVMe, SATA, HDD', categoryType: 'storage', icon: SaveIcon, color: '#6366F1' },
  { slug: 'power-supply', label: 'Power Supply', title: 'POWER SUPPLIES', desc: 'Modular & Semi-Modular', categoryType: 'power_supply', icon: BoltIcon, color: '#F59E0B' },
  { slug: 'case', label: 'Cabinet', title: 'PC CASES', desc: 'Mid, Full & Mini Tower', categoryType: 'case', icon: ComputerIcon, color: '#06B6D4' },
  { slug: 'cooling', label: 'Cooling', title: 'COOLING SOLUTIONS', desc: 'Air & Liquid Coolers', categoryType: 'cooling', icon: AcUnitIcon, color: '#0EA5E9' },
  { slug: 'accessories', label: 'Peripherals', title: 'PERIPHERALS', desc: 'Keyboard, Mouse, Headset', categoryType: 'accessories', icon: MouseIcon, color: '#8B5CF6' },
  { slug: 'monitor', label: 'Monitors', title: 'MONITORS', desc: 'Displays for every build', categoryType: '', icon: MonitorIcon, color: '#14B8A6' },
  { slug: 'software', label: 'Software', title: 'SOFTWARE', desc: 'Windows/Linux', categoryType: 'software', icon: MonitorIcon, color: '#16A34A' },
  { slug: 'networking', label: 'Networking', title: 'NETWORKING', desc: 'Routers, Switches & NICs', categoryType: 'networking', icon: DnsIcon, color: '#0369A1' },
];

export const LEGACY_CATEGORY_ALIASES = {
  'processor(cpu)': 'cpu',
  'processor': 'cpu',
  'cpu': 'cpu',
  'graphics card (gpu)': 'gpu',
  'gpu': 'gpu',
  'video card': 'gpu',
  'memory(ram)': 'ram',
  'memory': 'ram',
  'ram': 'ram',
  'power supply (psu)': 'power-supply',
  'power supply': 'power-supply',
  'psu': 'power-supply',
  'power-supply': 'power-supply',
  'computer case': 'case',
  'case': 'case',
  'cabinet': 'case',
  'ssd': 'storage',
  'peripherals': 'accessories',
  'acessories': 'accessories',
  'cooling': 'cooling',
  'storage': 'storage',
  'motherboard': 'motherboard',
  'software': 'software',
  'networking': 'networking',
};

export const CATEGORY_BY_SLUG = CATEGORIES.reduce((map, cat) => {
  map[cat.slug] = cat;
  return map;
}, {});

export const categoryPath = (slug) => `/components/${slug}`;

export const normalizeCategorySlug = (slug) => {
  const raw = String(slug || '').trim().toLowerCase();
  if (!raw) return '';
  try {
    const decoded = decodeURIComponent(raw);
    return LEGACY_CATEGORY_ALIASES[decoded] || CATEGORY_BY_SLUG[decoded]?.slug || '';
  } catch {
    return LEGACY_CATEGORY_ALIASES[raw] || CATEGORY_BY_SLUG[raw]?.slug || '';
  }
};

export const getCategoryType = (slug) => {
  const normalized = normalizeCategorySlug(slug);
  return CATEGORY_BY_SLUG[normalized]?.categoryType || '';
};

export const getCategory = (slug) => CATEGORY_BY_SLUG[normalizeCategorySlug(slug)] || null;
