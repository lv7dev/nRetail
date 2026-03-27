import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ApiError } from "@/utils/apiError";
import { storage } from "@/utils/storage";

if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    "[axios] VITE_API_BASE_URL is not set – requests will use relative paths",
  );
}

// Bare instance used only for token refresh — no interceptors to avoid loops
const refreshClient: AxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "",
});

// Singleton refresh promise — prevents concurrent refresh calls
let refreshPromise: Promise<void> | null = null;

// Extend config type to carry the retry flag
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "",
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: inject Bearer token ───────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: silent refresh + error normalisation ─────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig;

    // Silent refresh on 401
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;

      const refreshToken = storage.getRefreshToken();
      if (!refreshToken) {
        handleAuthFailure();
        return Promise.reject(normalizeError(error));
      }

      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient
            .post<{ accessToken: string; refreshToken: string }>(
              "/auth/refresh",
              { refreshToken },
            )
            .then(({ data }) => {
              storage.setTokens(data.accessToken, data.refreshToken);
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;

        // Retry original request with new token
        config.headers.Authorization = `Bearer ${storage.getAccessToken()}`;
        return apiClient(config);
      } catch {
        handleAuthFailure();
        return Promise.reject(normalizeError(error));
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

function handleAuthFailure(): void {
  storage.clearTokens();
  window.location.replace("/login");
}

function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body = error.response?.data as
      | { message?: string; code?: string }
      | undefined;
    const message = body?.message ?? error.message ?? "Unknown error";
    const code = body?.code;
    return new ApiError(status, message, code);
  }
  return new ApiError(0, "Network error");
}

// ─── Typed helpers (mirrors old api.ts surface) ──────────────────────────────
export function get<T>(path: string): Promise<T> {
  return apiClient.get<T>(path).then((r) => r.data);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return apiClient.post<T>(path, body).then((r) => r.data);
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return apiClient.put<T>(path, body).then((r) => r.data);
}

export function del<T>(path: string): Promise<T> {
  return apiClient.delete<T>(path).then((r) => r.data);
}
