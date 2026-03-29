import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

const mockUser = { id: '1', phone: '0901234567', name: 'Test', role: 'customer' };

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Protected content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isReady: false });
  });

  it('renders null while auth is not ready', () => {
    useAuthStore.setState({ user: null, isReady: false });
    const { container } = renderProtectedRoute();
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('redirects to /login when ready but no user', () => {
    useAuthStore.setState({ user: null, isReady: true });
    renderProtectedRoute();
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders Outlet when ready and authenticated', () => {
    useAuthStore.setState({ user: mockUser, isReady: true });
    renderProtectedRoute();
    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});
