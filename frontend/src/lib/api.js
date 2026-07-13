import axios from "axios";

/**
 * In dev, talk to the Express API on :8080 directly.
 * Vite's /api proxy breaks multipart file uploads (requests hang at 100%).
 * In production, use same-origin relative URLs.
 */
const apiBase =
  import.meta.env.VITE_BACKEND_DOMAIN ||
  (import.meta.env.DEV ? "http://localhost:8080" : "");

axios.defaults.baseURL = apiBase;
axios.defaults.withCredentials = true;

export default axios;
