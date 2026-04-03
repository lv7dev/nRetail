import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout';

vi.mock('@/components/shared/BottomNav', () => ({
  default: () => <nav aria-label="Bottom navigation">BottomNav</nav>,
}));

const renderAppLayout = (childContent = 'Page content') =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<div>{childContent}</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('AppLayout', () => {
  it('renders child route content via Outlet', () => {
    renderAppLayout('My page');
    expect(screen.getByText('My page')).toBeInTheDocument();
  });

  it('renders BottomNav', () => {
    renderAppLayout();
    expect(screen.getByRole('navigation', { name: 'Bottom navigation' })).toBeInTheDocument();
  });

  it('page-content has paddingBottom clearing the BottomNav', () => {
    const { container } = renderAppLayout();
    const pageContent = container.querySelector('.page-content')!;
    expect(pageContent.style.paddingBottom).toContain('--bottom-nav-height');
  });

  it('does not render any outlet name button', () => {
    renderAppLayout();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render ThemeSwitcher', () => {
    renderAppLayout();
    expect(screen.queryByText('ThemeSwitcher')).not.toBeInTheDocument();
  });

  it('does not render LanguageSwitcher', () => {
    renderAppLayout();
    expect(screen.queryByText('LanguageSwitcher')).not.toBeInTheDocument();
  });
});
