import { beforeEach, describe, expect, it, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient, get, post, put, del } from './axios';
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

// ─── Success response pass-through ──────────────────────────────────────────

describe('success response pass-through', () => {
  it('resolves with the response on 200', async () => {
    mockApi.onGet('/api/ok').reply(200, { data: { value: 42 } });
    const response = await apiClient.get('/api/ok');
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: { value: 42 } });
  });
});

// ─── Non-401 error normalisation ────────────────────────────────────────────

describe('non-401 errors normalised to ApiError', () => {
  it('rejects with ApiError on 500 with body', async () => {
    mockApi.onGet('/api/fail').reply(500, { message: 'Internal error', code: 'SERVER_ERROR' });
    const err = await apiClient.get('/api/fail').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
    expect(err.code).toBe('SERVER_ERROR');
  });

  it('rejects with ApiError on 404 without body message (falls back to error.message)', async () => {
    mockApi.onGet('/api/missing').reply(404, {});
    const err = await apiClient.get('/api/missing').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
    expect(typeof err.message).toBe('string');
  });

  it('rejects with ApiError(0, "Network error") on network failure', async () => {
    mockApi.onGet('/api/network').networkError();
    const err = await apiClient.get('/api/network').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(err.message).toBe('Network Error');
  });
});

// ─── Typed helper functions ──────────────────────────────────────────────────

describe('typed helpers unwrap the { data: T } envelope', () => {
  it('get<T> resolves with response.data.data', async () => {
    mockApi.onGet('/items').reply(200, { data: [1, 2, 3] });
    const result = await get<number[]>('/items');
    expect(result).toEqual([1, 2, 3]);
  });

  it('post<T> resolves with response.data.data', async () => {
    mockApi.onPost('/items').reply(201, { data: { id: 1 } });
    const result = await post<{ id: number }>('/items', { name: 'x' });
    expect(result).toEqual({ id: 1 });
  });

  it('put<T> resolves with response.data.data', async () => {
    mockApi.onPut('/items/1').reply(200, { data: { id: 1, name: 'y' } });
    const result = await put<{ id: number; name: string }>('/items/1', { name: 'y' });
    expect(result).toEqual({ id: 1, name: 'y' });
  });

  it('del<T> resolves with response.data.data', async () => {
    mockApi.onDelete('/items/1').reply(200, { data: null });
    const result = await del<null>('/items/1');
    expect(result).toBeNull();
  });
});
