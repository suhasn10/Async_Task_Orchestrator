import axios from "axios";

const baseUrl =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")) ||
  "http://localhost:8123";

const api = axios.create({
  baseURL: baseUrl,
});

export default api;
