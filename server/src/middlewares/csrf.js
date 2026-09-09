import ApiError from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return String(value || '').replace(/\/+$/, '');
  }
};

// Cookies are first-party and credentials are sent automatically, so CSRF
// protection relies on Origin / Sec-Fetch-Site validation for state-changing
// requests. Non-browser callers (webhooks, API clients) send neither header and
// are allowed through; supertest (tests) likewise sends no Origin.
const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const secFetchSite = req.headers['sec-fetch-site'];

  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:5173',
  ]
    .filter(Boolean)
    .map(normalizeOrigin);

  const requestOrigin = origin
    ? normalizeOrigin(origin)
    : referer
      ? normalizeOrigin(referer)
      : null;

  if (secFetchSite === 'cross-site' || (requestOrigin && !allowedOrigins.includes(requestOrigin))) {
    throw ApiError.forbidden('Cross-site request rejected');
  }

  next();
};

export default csrfProtection;