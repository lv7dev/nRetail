import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useOutletStore } from '@/store/useOutletStore';
import type { Outlet } from '@/types/outlet';

// Mock useOutletStore so we can control selectedOutlet
vi.mock('@/store/useOutletStore');

import OutletGuard from './OutletGuard';

const mockOutlet: Outlet = {
  id: 'outlet-1',
  name: 'Main Store',
  address: '123 Main St',
  role: 'OWNER',
};

function renderGuard(selectedOutlet: Outlet | null) {
  vi.mocked(useOutletStore).mockReturnValue({ selectedOutlet } as ReturnType<
    typeof useOutletStore
  >);

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<OutletGuard />}>
          <Route path="/" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/outlets" element={<div>Outlet Picker</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OutletGuard', () => {
  it('redirects to /outlets when selectedOutlet is null', () => {
    renderGuard(null);
    expect(screen.getByText('Outlet Picker')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when selectedOutlet is set', () => {
    renderGuard(mockOutlet);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Outlet Picker')).not.toBeInTheDocument();
  });
});
