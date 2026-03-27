import { beforeEach, describe, expect, it, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './axios';
import { storage } from '@/utils/storage';
import { ApiError } from '@/utils/apiError';

// Replace window.location so handleAuthFailure's window.location.replace() is spy-able
const mockLocationReplace = vi.fn();
Object.defineProperty(window, 'location', {
  configurable: true,
  value: { replace: mockLocationReplace },
});

// Intercept HTTP calls on the main apiClient
const mockApi = new MockAdapter(apiClient);

beforeEach(() => {
  mockApi.reset();
  localStorage.clear();
  mockLocationReplace.mockClear();
});

// ─── Unauthenticated requests (no Authorization header) ─────────────────────

describe('401 on unauthenticated request (no Authorization header)', () => {
  it('rejects with ApiError without redirecting to /login', async () => {
    // No access token in storage → request interceptor skips Authorization header
    mockApi.onPost('/auth/login').reply(401, {
      message: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
    });

    const err = await apiClient.post('/auth/login', {}).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.code).toBe('INVALID_CREDENTIALS');
    expect(mockLocationReplace).not.toHaveBeenCalled();
  });

  it('does not clear tokens when 401 received on unauthenticated request', async () => {
    const clearSpy = vi.spyOn(storage, 'clearTokens');
    mockApi.onPost('/auth/login').reply(401, { code: 'INVALID_CREDENTIALS' });

    await apiClient.post('/auth/login', {}).catch(() => {});

    expect(clearSpy).not.toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('POST /auth/login 401 propagates INVALID_CREDENTIALS error code to caller', async () => {
    mockApi.onPost('/auth/login').reply(401, {
      message: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
    });

    const err = await apiClient.post('/auth/login', {}).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /auth/otp/verify 401 propagates OTP_INVALID error code to caller without redirecting', async () => {
    mockApi.onPost('/auth/otp/verify').reply(401, {
      message: 'Invalid OTP',
      code: 'OTP_INVALID',
    });

    const err = await apiClient.post('/auth/otp/verify', {}).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('OTP_INVALID');
    expect(mockLocationReplace).not.toHaveBeenCalled();
  });
});

// ─── Authenticated requests (Authorization header present) ───────────────────

describe('401 on authenticated request (has Authorization header)', () => {
  it('calls handleAuthFailure when 401 received and no refresh token is available', async () => {
    // Access token present → request interceptor adds Authorization header
    // No refresh token → refresh attempt skipped → handleAuthFailure called
    localStorage.setItem('accessToken', 'valid-access-token');

    mockApi.onGet('/api/protected').reply(401, { message: 'Token expired' });

    await apiClient.get('/api/protected').catch(() => {});

    expect(mockLocationReplace).toHaveBeenCalledWith('/login');
  });
});
