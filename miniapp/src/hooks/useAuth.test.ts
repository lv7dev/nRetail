import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import {
  useLogin,
  useLogout,
  useRequestOtp,
  useVerifyOtp,
  useRegister,
  useResetPassword,
  useMe,
} from './useAuth';
import { useAuthStore } from '@/store/useAuthStore';

// ── mock authService ──────────────────────────────────────────────────────────
const { mockAuthService, mockStorage } = vi.hoisted(() => ({
  mockAuthService: {
    login: vi.fn(),
    logout: vi.fn(),
    requestRegisterOtp: vi.fn(),
    requestForgotPasswordOtp: vi.fn(),
    verifyOtp: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
    getMe: vi.fn(),
  },
  mockStorage: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn().mockReturnValue('refresh-tok'),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

vi.mock('@/services/authService', () => ({ authService: mockAuthService }));
vi.mock('@/utils/storage', () => ({ storage: mockStorage }));

// ── helpers ───────────────────────────────────────────────────────────────────
function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

const mockUser = { id: '1', phone: '0901234567', name: 'Alice', role: 'customer' as const };
const mockTokenPair = { accessToken: 'acc', refreshToken: 'ref', user: mockUser };

beforeEach(() => {
  useAuthStore.setState({ user: null, isReady: false });
  vi.clearAllMocks();
  mockStorage.getRefreshToken.mockReturnValue('refresh-tok');
});

// ── useLogin ──────────────────────────────────────────────────────────────────
describe('useLogin', () => {
  it('calls setTokens and setAuth on success', async () => {
    mockAuthService.login.mockResolvedValue(mockTokenPair);
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });
    act(() => result.current.mutate({ phone: '0901234567', password: 'pass' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockStorage.setTokens).toHaveBeenCalledWith('acc', 'ref');
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });
});

// ── useLogout ─────────────────────────────────────────────────────────────────
describe('useLogout', () => {
  it('calls clearAuth on settled (success)', async () => {
    mockAuthService.logout.mockResolvedValue(undefined);
    useAuthStore.setState({ user: mockUser, isReady: true });
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('calls clearAuth on settled (error)', async () => {
    mockAuthService.logout.mockRejectedValue(new Error('network'));
    useAuthStore.setState({ user: mockUser, isReady: true });
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('passes empty string to logout when getRefreshToken returns null', async () => {
    mockStorage.getRefreshToken.mockReturnValue(null);
    mockAuthService.logout.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAuthService.logout).toHaveBeenCalledWith('');
  });
});

// ── useRequestOtp ─────────────────────────────────────────────────────────────
describe('useRequestOtp', () => {
  it('calls requestRegisterOtp for register flow', async () => {
    mockAuthService.requestRegisterOtp.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRequestOtp('register'), { wrapper: makeWrapper() });
    act(() => result.current.mutate('0901234567'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAuthService.requestRegisterOtp).toHaveBeenCalledWith('0901234567');
  });

  it('calls requestForgotPasswordOtp for forgot flow', async () => {
    mockAuthService.requestForgotPasswordOtp.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRequestOtp('forgot'), { wrapper: makeWrapper() });
    act(() => result.current.mutate('0901234567'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAuthService.requestForgotPasswordOtp).toHaveBeenCalledWith('0901234567');
  });
});

// ── useVerifyOtp ──────────────────────────────────────────────────────────────
describe('useVerifyOtp', () => {
  it('calls verifyOtp with phone and otp', async () => {
    mockAuthService.verifyOtp.mockResolvedValue({ otpToken: 'tok' });
    const { result } = renderHook(() => useVerifyOtp(), { wrapper: makeWrapper() });
    act(() => result.current.mutate({ phone: '0901234567', otp: '999999' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAuthService.verifyOtp).toHaveBeenCalledWith('0901234567', '999999');
  });
});

// ── useRegister ───────────────────────────────────────────────────────────────
describe('useRegister', () => {
  it('calls setTokens and setAuth on success', async () => {
    mockAuthService.register.mockResolvedValue(mockTokenPair);
    const { result } = renderHook(() => useRegister(), { wrapper: makeWrapper() });
    act(() =>
      result.current.mutate({
        otpToken: 'tok',
        name: 'Alice',
        password: 'pass',
        confirmPassword: 'pass',
      }),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockStorage.setTokens).toHaveBeenCalledWith('acc', 'ref');
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });
});

// ── useResetPassword ──────────────────────────────────────────────────────────
describe('useResetPassword', () => {
  it('calls resetPassword service', async () => {
    mockAuthService.resetPassword.mockResolvedValue(undefined);
    const { result } = renderHook(() => useResetPassword(), { wrapper: makeWrapper() });
    act(() =>
      result.current.mutate({ otpToken: 'tok', newPassword: 'pass', confirmPassword: 'pass' }),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith('tok', 'pass', 'pass');
  });
});

// ── useMe ─────────────────────────────────────────────────────────────────────
describe('useMe', () => {
  it('returns a disabled query (does not fetch on mount)', () => {
    const { result } = renderHook(() => useMe(), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockAuthService.getMe).not.toHaveBeenCalled();
  });
});
