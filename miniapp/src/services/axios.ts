import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/utils/apiError';
import { storage } from '@/utils/storage';

/* v8 ignore next 3 */
if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  console.warn('[axios] VITE_API_BASE_URL is not set – requests will use relative paths');
}

// Bare instance used only for token refresh — no interceptors to avoid loops
const refreshClient: AxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
});

// Singleton refresh promise — prevents concurrent refresh calls
let refreshPromise: Promise<void> | null = null;

// Extend config type to carry the retry flag
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
  headers: { 'Content-Type': 'application/json' },
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

    // Silent refresh on 401 — only for authenticated requests (those that carried a Bearer token).
    // Unauthenticated requests (login, OTP verify, etc.) return 401 for business reasons;
    // we must propagate the error rather than redirecting the user to login.
    const wasAuthenticated = !!config.headers?.Authorization;
    if (error.response?.status === 401 && !config._retry && wasAuthenticated) {
      config._retry = true;

      const refreshToken = storage.getRefreshToken();
      if (!refreshToken) {
        handleAuthFailure();
        return Promise.reject(normalizeError(error));
      }

      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient
            // The backend ResponseInterceptor wraps all responses as { data: T },
            // so the actual token pair is at response.data.data (not response.data).
            .post<{ data: { accessToken: string; refreshToken: string } }>('/auth/refresh', {
              refreshToken,
            })
            .then(({ data }) => {
              storage.setTokens(data.data.accessToken, data.data.refreshToken);
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
  window.location.replace('/login');
}

function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body = error.response?.data as { message?: string; code?: string } | undefined;
    const message = body?.message ?? error.message ?? 'Unknown error';
    const code = body?.code;
    return new ApiError(status, message, code);
  }
  return new ApiError(0, 'Network error');
}

// ─── Typed helpers (mirrors old api.ts surface) ──────────────────────────────
// The backend ResponseInterceptor wraps all responses as { data: T }.
// These helpers unwrap that envelope so callers work with T directly.
export function get<T>(path: string): Promise<T> {
  return apiClient.get<{ data: T }>(path).then((r) => r.data.data);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return apiClient.post<{ data: T }>(path, body).then((r) => r.data.data);
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return apiClient.put<{ data: T }>(path, body).then((r) => r.data.data);
}

export function del<T>(path: string): Promise<T> {
  return apiClient.delete<{ data: T }>(path).then((r) => r.data.data);
}
