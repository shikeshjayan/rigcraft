export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;

export const isGoogleOAuthEnabled = () => Boolean(googleClientId);

export const getGoogleClientId = () => googleClientId;
