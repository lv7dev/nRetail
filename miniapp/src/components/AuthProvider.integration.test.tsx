/**
 * Integration tests for AuthProvider — uses MSW to intercept GET /auth/me.
 * Runs under vitest.integration.config.ts (VITE_API_BASE_URL=http://localhost).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import AuthProvider from './AuthProvider';
import { useAuthStore } from '@/store/useAuthStore';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, isReady: false });
});

describe('AuthProvider integration', () => {
  it('renders children and sets user when getMe succeeds', async () => {
    localStorage.setItem('accessToken', 'valid-token');
    render(<AuthProvider><div>app content</div></AuthProvider>);
    await waitFor(() => expect(screen.getByText('app content')).toBeInTheDocument());
    expect(useAuthStore.getState().user).not.toBeNull();
    expect(useAuthStore.getState().isReady).toBe(true);
  });

  it('clears auth and shows children when getMe returns 401', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    server.use(
      http.get('*/auth/me', () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );
    render(<AuthProvider><div>app content</div></AuthProvider>);
    await waitFor(() => expect(screen.getByText('app content')).toBeInTheDocument());
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isReady).toBe(true);
  });

  it('makes no network call and renders children immediately when no token', async () => {
    // No token → should not call /auth/me at all
    let getmeCalled = false;
    server.use(
      http.get('*/auth/me', () => {
        getmeCalled = true;
        return HttpResponse.json({ data: {} });
      }),
    );
    render(<AuthProvider><div>app content</div></AuthProvider>);
    await waitFor(() => expect(screen.getByText('app content')).toBeInTheDocument());
    expect(getmeCalled).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
