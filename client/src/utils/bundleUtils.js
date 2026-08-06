export const formatINR = (n) => {
  const num = Number(n);
  return `₹${Number.isFinite(num) ? num.toLocaleString('en-IN') : 0}`;
};

export const getMemberImage = (item) => {
  if (!item) return null;
  if (typeof item.image === 'string') return item.image;
  if (item.image?.url) return item.image.url;
  if (typeof item.images?.[0] === 'string') return item.images[0];
  return item.images?.[0]?.url || null;
};

export const getMemberPrice = (item) => {
  if (!item) return 0;
  const sale = Number(item.pricing?.salePrice ?? item.salePrice);
  const regular = Number(item.pricing?.price ?? item.price ?? 0);
  return sale > 0 ? sale : regular;
};

export const getBundlePrice = (bundle) => {
  const members = [...(bundle.products || []), ...(bundle.prebuiltPCs || [])];
  const itemsTotal = members.reduce((sum, item) => sum + getMemberPrice(item), 0);
  const bundlePrice = Number(bundle.bundlePrice) || 0;
  const savings = Number(bundle.savings) || Math.max(0, itemsTotal - bundlePrice);
  const discountPct =
    Number(bundle.discountPct) ||
    (itemsTotal > 0 ? Math.round((savings / itemsTotal) * 100) : 0);
  return { bundlePrice, itemsTotal, savings, discountPct };
};
