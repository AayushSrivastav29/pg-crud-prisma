import axios, { AxiosInstance } from "axios";

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // In development, proxy through Vite
  if (import.meta.env.DEV) {
    return "/api";
  }

  // In production, use environment variable or fallback
  const apiUrl =
    import.meta.env.VITE_API_BASE_URL || window.location.origin + "/api";
  return apiUrl;
};

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  },
);

export default api;
