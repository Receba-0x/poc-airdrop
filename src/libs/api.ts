import { getCsrfToken } from "@/utils/getCsrfToken";
import axios, { type AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  if (needsCsrfProtection(config)) {
    const csrfToken = await getCsrfToken();
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});

function needsCsrfProtection(config: AxiosRequestConfig) {
  const protectedMethods = ["post", "put", "patch", "delete"];
  const protectedEndpoints = ["/lootbox", "/items", "/purchases"];

  return (
    protectedMethods.includes(config.method?.toLowerCase() || "") &&
    protectedEndpoints.some((endpoint) => config.url?.includes(endpoint))
  );
}

export default api;
