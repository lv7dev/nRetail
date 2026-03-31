import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { useOutletStore } from '@/store/useOutletStore';
import type { Outlet } from '@/types/outlet';
import AppLayout from './AppLayout';

vi.mock('@/components/shared/BottomNav', () => ({
  default: () => <nav aria-label="Bottom navigation">BottomNav</nav>,
}));

vi.mock('@/store/useOutletStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockOutlet: Outlet = {
  id: 'outlet-1',
  name: 'Main Store',
  address: '123 Main St',
  role: 'OWNER',
};

const renderAppLayout = (selectedOutlet: Outlet | null = null, childContent = 'Page content') => {
  vi.mocked(useOutletStore).mockReturnValue({
    selectedOutlet,
    setSelectedOutlet: vi.fn(),
    clearSelectedOutlet: vi.fn(),
  } as ReturnType<typeof useOutletStore>);

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<div>{childContent}</div>} />
        </Route>
        <Route path="/outlets" element={<div>Outlet Picker</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('AppLayout', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders child route content via Outlet', () => {
    renderAppLayout(null, 'My page');
    expect(screen.getByText('My page')).toBeInTheDocument();
  });

  it('renders BottomNav', () => {
    renderAppLayout();
    expect(screen.getByRole('navigation', { name: 'Bottom navigation' })).toBeInTheDocument();
  });

  it('shows outlet name when outlet is selected', () => {
    renderAppLayout(mockOutlet);
    expect(screen.getByText('Main Store')).toBeInTheDocument();
  });

  it('tapping outlet name navigates to /outlets', async () => {
    renderAppLayout(mockOutlet);
    await userEvent.click(screen.getByRole('button', { name: 'Main Store' }));
    expect(mockNavigate).toHaveBeenCalledWith('/outlets');
  });
});
