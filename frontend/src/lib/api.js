import axios from "axios";

/**
 * API base URL resolution:
 * - Dev: direct to Express on :8080 (Vite proxy breaks file uploads)
 * - Production: same-origin (empty base) unless a real remote API URL is configured
 * Never use localhost in production builds — it breaks live admin/data fetching.
 */
function getApiBase() {
  const configured = (import.meta.env.VITE_BACKEND_DOMAIN || "").trim();
  const isLocalhost =
    !configured ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(configured);

  if (import.meta.env.PROD) {
    return isLocalhost ? "" : configured;
  }

  return configured || "http://localhost:8080";
}

axios.defaults.baseURL = getApiBase();
axios.defaults.withCredentials = true;

export default axios;
