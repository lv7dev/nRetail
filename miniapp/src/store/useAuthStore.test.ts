import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { useOutletStore } from './useOutletStore';
import type { Outlet } from '@/types/outlet';

vi.mock('@/utils/storage', () => ({
  storage: {
    clearTokens: vi.fn(),
  },
}));

import { storage } from '@/utils/storage';

const mockUser = { id: '1', phone: '0901234567', name: 'Test', role: 'customer' };
const mockOutlet: Outlet = {
  id: 'outlet-1',
  name: 'Main Store',
  address: '123 Main St',
  role: 'OWNER',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isReady: false });
    useOutletStore.setState({ selectedOutlet: null });
    vi.mocked(storage.clearTokens).mockClear();
  });

  it('has null user and isReady=false initially', () => {
    const { user, isReady } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isReady).toBe(false);
  });

  it('setAuth sets user and marks isReady=true', () => {
    useAuthStore.getState().setAuth(mockUser);
    const { user, isReady } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(isReady).toBe(true);
  });

  it('clearAuth nulls user and calls storage.clearTokens', () => {
    useAuthStore.setState({ user: mockUser, isReady: true });
    useAuthStore.getState().clearAuth();
    const { user } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(storage.clearTokens).toHaveBeenCalledOnce();
  });

  it('clearAuth also clears selectedOutlet from useOutletStore', () => {
    useAuthStore.setState({ user: mockUser, isReady: true });
    useOutletStore.setState({ selectedOutlet: mockOutlet });
    useAuthStore.getState().clearAuth();
    expect(useOutletStore.getState().selectedOutlet).toBeNull();
  });
});
