/**
 * Integration tests for axios interceptor behaviour.
 *
 * These tests use the real `apiClient` instance with MSW intercepting at the
 * network layer — NOT axios-mock-adapter. Each test exercises the full request
 * → interceptor → response → interceptor pipeline.
 *
 * URL matching: MSW v2 Node server requires absolute URLs or wildcard-origin
 * patterns (e.g. "*" + "/path"). The vitest.integration.config.ts sets
 * VITE_API_BASE_URL=http://localhost so that axios sends requests to absolute
 * URLs that MSW can intercept.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { apiClient } from './axios';
import { storage } from '@/utils/storage';
import { ApiError } from '@/utils/apiError';

// ─── Mock window.location so handleAuthFailure's redirect is spy-able ────────
const mockLocationReplace = vi.fn();
Object.defineProperty(window, 'location', {
  configurable: true,
  value: { replace: mockLocationReplace },
});

beforeEach(() => {
  localStorage.clear();
  mockLocationReplace.mockClear();
});

// ─── 2.1  Bearer token injected into authenticated requests ─────────────────

describe('2.1 Bearer token injection', () => {
  it('attaches Authorization header when access token is in storage', async () => {
    localStorage.setItem('accessToken', 'my-access-token');

    let capturedAuth: string | null = null;
    server.use(
      http.get('*/api/protected', ({ request }) => {
        capturedAuth = request.headers.get('Authorization');
        return HttpResponse.json({ data: { secret: 'value' } });
      }),
    );

    await apiClient.get('/api/protected');

    expect(capturedAuth).toBe('Bearer my-access-token');
  });

  it('does not attach Authorization header when no access token is in storage', async () => {
    // No token in localStorage → request interceptor skips Authorization

    let capturedAuth: string | null = null;
    server.use(
      http.get('*/api/protected', ({ request }) => {
        capturedAuth = request.headers.get('Authorization');
        return HttpResponse.json({ data: { value: 'ok' } });
      }),
    );

    await apiClient.get('/api/protected');

    expect(capturedAuth).toBeNull();
  });
});

// ─── 2.2  Silent refresh on 401 from authenticated request ──────────────────

describe('2.2 Silent refresh on authenticated 401', () => {
  it('calls /auth/refresh and retries the original request', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('refreshToken', 'valid-refresh');

    let protectedCallCount = 0;
    server.use(
      http.get('*/api/protected', () => {
        protectedCallCount++;
        if (protectedCallCount === 1) {
          // First call returns 401 → interceptor triggers refresh + retry
          return HttpResponse.json(
            { message: 'Token expired', code: 'TOKEN_EXPIRED' },
            { status: 401 },
          );
        }
        // Retry after refresh → success
        return HttpResponse.json({ data: { secret: 'value' } });
      }),
      http.post('*/auth/refresh', () =>
        HttpResponse.json({
          data: { accessToken: 'refreshed-access', refreshToken: 'refreshed-refresh' },
        }),
      ),
    );

    const response = await apiClient.get('/api/protected');

    expect(response.status).toBe(200);
    expect(protectedCallCount).toBe(2);
  });

  it('stores new tokens returned by /auth/refresh', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('refreshToken', 'valid-refresh');

    let callCount = 0;
    server.use(
      http.get('*/api/protected', () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json({ message: 'Token expired' }, { status: 401 });
        }
        return HttpResponse.json({ data: { ok: true } });
      }),
      http.post('*/auth/refresh', () =>
        HttpResponse.json({
          data: { accessToken: 'refreshed-access', refreshToken: 'refreshed-refresh' },
        }),
      ),
    );

    await apiClient.get('/api/protected');

    expect(storage.getAccessToken()).toBe('refreshed-access');
    expect(storage.getRefreshToken()).toBe('refreshed-refresh');
  });
});

// ─── 2.3  Forced logout when no refresh token in storage ────────────────────

describe('2.3 Forced logout — no refresh token', () => {
  it('clears tokens and redirects to /login when there is no refresh token', async () => {
    // Access token present → request gets Authorization header → 401 → interceptor
    // checks refresh token → none found → handleAuthFailure
    localStorage.setItem('accessToken', 'expired-token');
    // No refresh token

    server.use(
      http.get('*/api/protected', () =>
        HttpResponse.json({ message: 'Token expired' }, { status: 401 }),
      ),
    );

    await apiClient.get('/api/protected').catch(() => {});

    expect(mockLocationReplace).toHaveBeenCalledWith('/login');
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it('rejects with ApiError when no refresh token', async () => {
    localStorage.setItem('accessToken', 'expired-token');

    server.use(
      http.get('*/api/protected', () =>
        HttpResponse.json({ message: 'Token expired' }, { status: 401 }),
      ),
    );

    const err = await apiClient.get('/api/protected').catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
  });
});

// ─── 2.4  Forced logout when refresh endpoint returns 401 ───────────────────

describe('2.4 Forced logout — refresh endpoint fails', () => {
  it('clears tokens and redirects to /login when /auth/refresh returns 401', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('refreshToken', 'invalid-refresh');

    server.use(
      http.get('*/api/protected', () =>
        HttpResponse.json({ message: 'Token expired' }, { status: 401 }),
      ),
      http.post('*/auth/refresh', () =>
        HttpResponse.json(
          { code: 'REFRESH_TOKEN_INVALID', message: 'Refresh token invalid' },
          { status: 401 },
        ),
      ),
    );

    await apiClient.get('/api/protected').catch(() => {});

    expect(mockLocationReplace).toHaveBeenCalledWith('/login');
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it('rejects with ApiError when refresh fails', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('refreshToken', 'invalid-refresh');

    server.use(
      http.get('*/api/protected', () =>
        HttpResponse.json({ message: 'Token expired' }, { status: 401 }),
      ),
      http.post('*/auth/refresh', () =>
        HttpResponse.json(
          { code: 'REFRESH_TOKEN_INVALID', message: 'Refresh token invalid' },
          { status: 401 },
        ),
      ),
    );

    const err = await apiClient.get('/api/protected').catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
  });
});

// ─── 2.5  Concurrent 401s use a single refresh call ─────────────────────────

describe('2.5 Concurrent 401s — single refresh call', () => {
  it('issues only ONE /auth/refresh call when two requests simultaneously receive 401', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('refreshToken', 'valid-refresh');

    let refreshCallCount = 0;
    let r1Count = 0;
    let r2Count = 0;

    server.use(
      http.get('*/api/resource1', () => {
        r1Count++;
        if (r1Count === 1) {
          return HttpResponse.json({ message: 'Token expired' }, { status: 401 });
        }
        return HttpResponse.json({ data: { id: 1 } });
      }),
      http.get('*/api/resource2', () => {
        r2Count++;
        if (r2Count === 1) {
          return HttpResponse.json({ message: 'Token expired' }, { status: 401 });
        }
        return HttpResponse.json({ data: { id: 2 } });
      }),
      http.post('*/auth/refresh', async () => {
        refreshCallCount++;
        // Small delay to allow both concurrent 401 callbacks to pile up before resolving
        await new Promise((r) => setTimeout(r, 50));
        return HttpResponse.json({
          data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' },
        });
      }),
    );

    await Promise.all([
      apiClient.get('/api/resource1').catch(() => null),
      apiClient.get('/api/resource2').catch(() => null),
    ]);

    expect(refreshCallCount).toBe(1);
  });
});

// ─── 2.6  Unauthenticated 401 propagates as ApiError without redirect ────────

describe('2.6 Unauthenticated 401 — propagates as ApiError, no redirect', () => {
  it('rejects with ApiError when no Authorization header and server returns 401', async () => {
    // No access token in storage → request interceptor omits Authorization header
    // → response interceptor sees no Authorization → treats as business error
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json(
          { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
          { status: 401 },
        ),
      ),
    );

    const err = await apiClient.post('/auth/login', {}).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.code).toBe('INVALID_CREDENTIALS');
  });

  it('does NOT call window.location.replace on unauthenticated 401', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json(
          { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
          { status: 401 },
        ),
      ),
    );

    await apiClient.post('/auth/login', {}).catch(() => {});

    expect(mockLocationReplace).not.toHaveBeenCalled();
  });

  it('does NOT clear tokens on unauthenticated 401', async () => {
    // No access token in storage → request has no Authorization header
    server.use(
      http.post('*/auth/otp/verify', () =>
        HttpResponse.json({ message: 'Invalid OTP', code: 'OTP_INVALID' }, { status: 401 }),
      ),
    );

    await apiClient.post('/auth/otp/verify', {}).catch(() => {});

    expect(storage.getAccessToken()).toBeNull();
    expect(mockLocationReplace).not.toHaveBeenCalled();
  });
});
