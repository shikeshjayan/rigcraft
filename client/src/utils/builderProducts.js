/**
 * builderProducts — shared helpers for the PC Builder pages.
 * Normalizes raw product objects (from the API or the localStorage draft)
 * into the shape the builder UI expects, and maps category names onto the
 * builder's canonical part slots.
 */

export const BUILDER_CATEGORIES = ['cpu', 'motherboard', 'ram', 'ssd', 'gpu', 'cabinet', 'psu', 'cooling'];

const DRAFT_CATEGORY_MAP = {
  processor: 'cpu',
  motherboard: 'motherboard',
  ram: 'ram',
  storage: 'ssd',
  gpu: 'gpu',
  case: 'cabinet',
  'power-supply': 'psu',
  cooling: 'cooling',
  cpu: 'cpu',
  ssd: 'ssd',
  cabinet: 'cabinet',
  psu: 'psu'
};

export const normalizeCategory = (value) => {
  const categoryName = String(value || '').toLowerCase();
  if (!categoryName) return categoryName;
  if (categoryName.includes('motherboard')) return 'motherboard';
  if (categoryName.includes('cooling') || categoryName.includes('cooler')) return 'cooling';
  if (categoryName.includes('cpu') || categoryName.includes('processor')) return 'cpu';
  if (categoryName.includes('graphic') || categoryName.includes('gpu')) return 'gpu';
  if (categoryName.includes('memory') || categoryName.includes('ram')) return 'ram';
  if (categoryName.includes('storage') || categoryName.includes('ssd') || categoryName.includes('hdd')) return 'ssd';
  if (categoryName.includes('power') || categoryName.includes('psu')) return 'psu';
  if (categoryName.includes('case') || categoryName.includes('cabinet')) return 'cabinet';
  if (categoryName.includes('accessory') || categoryName.includes('accessories')) return 'accessory';
  return categoryName;
};

export const getRawCategory = (p) =>
  p.category?.name || p.categoryType || (typeof p.category === 'string' && p.category) || p.productType || '';

export const normalizeBuilderProduct = (p) => {
  const priceVal = Number(p.pricing?.price || p.priceVal || p.price || 0) || 0;
  const mrpVal = Number(p.pricing?.salePrice || p.mrpVal || p.mrp || 0) || 0;
  return {
    ...p,
    id: p._id || p.id,
    image: p.images?.[0]?.url || p.images?.[0] || p.image || null,
    title: p.name || p.title,
    price: priceVal ? `₹${priceVal.toLocaleString()}` : p.price,
    priceVal,
    mrp: mrpVal ? `₹${mrpVal.toLocaleString()}` : p.mrp,
    category: normalizeCategory(getRawCategory(p)),
    brand: typeof p.brand === 'string' ? p.brand : p.brand?.name || 'Unknown',
    specs: p.specifications ? Object.entries(p.specifications).map(([k, v]) => `${k}: ${v}`) : []
  };
};

export const normalizeDraftBuild = (draft) => {
  if (!draft || typeof draft !== 'object') return {};
  const mapped = {};
  Object.entries(draft).forEach(([key, product]) => {
    if (!product) return;
    const finalKey = DRAFT_CATEGORY_MAP[key.toLowerCase()] || key.toLowerCase();
    mapped[finalKey] = normalizeBuilderProduct(product);
  });
  return mapped;
};
