/**
 * Centralized access to environment variables.
 *
 * Vite only exposes variables prefixed with VITE_ to client code — this is
 * a safety feature, not a limitation. Never put secret API keys here; the
 * AI provider's key belongs on the backend, never in the frontend bundle.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
};
