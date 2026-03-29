import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AuthProvider from './AuthProvider';
import { useAuthStore } from '@/store/useAuthStore';

const { mockGetMe, mockGetAccessToken } = vi.hoisted(() => ({
  mockGetMe: vi.fn(),
  mockGetAccessToken: vi.fn(),
}));

vi.mock('@/services/authService', () => ({
  authService: { getMe: mockGetMe },
}));

vi.mock('@/utils/storage', () => ({
  storage: {
    getAccessToken: mockGetAccessToken,
    getRefreshToken: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

const mockUser = { id: '1', phone: '0901234567', name: 'Alice', role: 'customer' as const };

beforeEach(() => {
  useAuthStore.setState({ user: null, isReady: false });
  mockGetAccessToken.mockReset();
  mockGetMe.mockReset();
});

describe('AuthProvider', () => {
  it('shows SplashPage while loading (isReady=false)', () => {
    // Hang getMe indefinitely so isReady stays false
    mockGetAccessToken.mockReturnValue('token');
    mockGetMe.mockReturnValue(new Promise(() => {}));
    render(<AuthProvider><div>app</div></AuthProvider>);
    expect(screen.getByText('nRetail')).toBeInTheDocument();
    expect(screen.queryByText('app')).not.toBeInTheDocument();
  });

  it('marks isReady without user when no token', async () => {
    mockGetAccessToken.mockReturnValue(null);
    render(<AuthProvider><div>app</div></AuthProvider>);
    await waitFor(() => expect(screen.getByText('app')).toBeInTheDocument());
    expect(useAuthStore.getState().isReady).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('calls setAuth and renders children on getMe success', async () => {
    mockGetAccessToken.mockReturnValue('token');
    mockGetMe.mockResolvedValue(mockUser);
    render(<AuthProvider><div>app</div></AuthProvider>);
    await waitFor(() => expect(screen.getByText('app')).toBeInTheDocument());
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isReady).toBe(true);
  });

  it('calls clearAuth and marks ready on getMe failure', async () => {
    mockGetAccessToken.mockReturnValue('token');
    mockGetMe.mockRejectedValue(new Error('401'));
    render(<AuthProvider><div>app</div></AuthProvider>);
    await waitFor(() => expect(screen.getByText('app')).toBeInTheDocument());
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isReady).toBe(true);
  });
});
