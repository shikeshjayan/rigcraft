const STOCK_PATTERN = /insufficient stock/i;
const NAME_PATTERNS = [
  /^"(.+)" has insufficient stock/i,
  /insufficient stock for (.+)$/i,
];

export const isStockMessage = (raw) =>
  typeof raw === "string" && STOCK_PATTERN.test(raw);

export const friendlyStockMessage = (raw) => {
  if (!isStockMessage(raw)) return null;

  for (const pattern of NAME_PATTERNS) {
    const match = raw.match(pattern);
    if (match && match[1]?.trim()) {
      return `${match[1].trim()} is currently out of stock or has limited availability.`;
    }
  }

  return "This item is currently out of stock or has limited availability.";
};

export default friendlyStockMessage;