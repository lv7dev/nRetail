import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import AuthLayout from './AuthLayout';

vi.mock('@/components/shared/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <button aria-label="Change language">Lang</button>,
}));

const renderAuthLayout = (childContent = 'Child content') =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<div>{childContent}</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('AuthLayout', () => {
  it('renders child route content via Outlet', () => {
    renderAuthLayout('Hello from child');
    expect(screen.getByText('Hello from child')).toBeInTheDocument();
  });

  it('renders the LanguageSwitcher', () => {
    renderAuthLayout();
    expect(screen.getByRole('button', { name: 'Change language' })).toBeInTheDocument();
  });
});
