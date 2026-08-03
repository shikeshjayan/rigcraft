export const getRecentSearches = (key, max = 8) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t) => typeof t === "string" && t.trim()).slice(0, max);
  } catch {
    return [];
  }
};

export const addRecentSearch = (key, term, max = 8) => {
  const value = term?.trim();
  if (!value) return;
  const existing = getRecentSearches(key, max).filter(
    (t) => t.toLowerCase() !== value.toLowerCase()
  );
  const next = [value, ...existing].slice(0, max);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // storage unavailable — ignore
  }
  return next;
};

export const clearRecentSearches = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // storage unavailable — ignore
  }
};
