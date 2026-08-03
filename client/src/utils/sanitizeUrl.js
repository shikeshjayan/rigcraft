/**
 * sanitizeUrl — guards against dangerous URL schemes (XSS via href/src).
 * Only http:, https:, and mailto: are allowed.
 * If no protocol is present, https:// is prepended.
 */
const DANGEROUS_SCHEMES = ["javascript:", "data:", "vbscript:", "file:", "about:"];

export const sanitizeUrl = (url) => {
  if (!url || typeof url !== "string") return "about:blank";

  const trimmed = url.trim();
  if (!trimmed) return "about:blank";

  const lower = trimmed.toLowerCase();

  for (const scheme of DANGEROUS_SCHEMES) {
    if (lower.startsWith(scheme) || lower.startsWith(scheme.replace(":", ":"))) return "about:blank";
  }

  if (/^[a-z][a-z0-9+.\-]*:/i.test(trimmed)) {
    if (
      !lower.startsWith("http://") &&
      !lower.startsWith("https://") &&
      !lower.startsWith("mailto:") &&
      !lower.startsWith("tel:")
    ) {
      return "about:blank";
    }
    return trimmed;
  }

  return `https://${trimmed}`;
};

export default sanitizeUrl;
