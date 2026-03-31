import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { outletService } from '@/services/outletService';
import { useOutletStore } from '@/store/useOutletStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Outlet } from '@/types/outlet';

// Mock services and stores
vi.mock('@/services/outletService');
vi.mock('@/store/useOutletStore');
vi.mock('@/store/useAuthStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import OutletListPage from './index';

const mockOutlet1: Outlet = {
  id: 'outlet-1',
  name: 'Main Store',
  address: '123 Main St',
  role: 'OWNER',
};

const mockOutlet2: Outlet = {
  id: 'outlet-2',
  name: 'Branch Store',
  address: '456 Branch Ave',
  role: 'MANAGER',
};

const mockSetSelectedOutlet = vi.fn();
const mockClearAuth = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

function renderPage() {
  const Wrapper = createWrapper();
  return render(
    <Wrapper>
      <OutletListPage />
    </Wrapper>,
  );
}

describe('OutletListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(useOutletStore).mockReturnValue({
      selectedOutlet: null,
      setSelectedOutlet: mockSetSelectedOutlet,
      clearSelectedOutlet: vi.fn(),
    } as ReturnType<typeof useOutletStore>);
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isReady: true,
      setAuth: vi.fn(),
      clearAuth: mockClearAuth,
    } as ReturnType<typeof useAuthStore>);
  });

  it('shows loading state while fetching', () => {
    vi.mocked(outletService.getMyOutlets).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('auto-selects and navigates to / when exactly 1 outlet', async () => {
    vi.mocked(outletService.getMyOutlets).mockResolvedValue([mockOutlet1]);
    renderPage();
    await waitFor(() => {
      expect(mockSetSelectedOutlet).toHaveBeenCalledWith(mockOutlet1);
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('renders outlet list when multiple outlets', async () => {
    vi.mocked(outletService.getMyOutlets).mockResolvedValue([mockOutlet1, mockOutlet2]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
      expect(screen.getByText('Branch Store')).toBeInTheDocument();
    });
  });

  it('shows empty state when 0 outlets', async () => {
    vi.mocked(outletService.getMyOutlets).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/outlets\.noOutlets/i)).toBeInTheDocument();
    });
  });

  it('tapping an outlet calls setSelectedOutlet and navigates to /', async () => {
    vi.mocked(outletService.getMyOutlets).mockResolvedValue([mockOutlet1, mockOutlet2]);
    renderPage();
    await waitFor(() => screen.getByText('Main Store'));
    await userEvent.click(screen.getByRole('button', { name: /Main Store/i }));
    expect(mockSetSelectedOutlet).toHaveBeenCalledWith(mockOutlet1);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('logout button on empty state calls clearAuth and navigates to /login', async () => {
    vi.mocked(outletService.getMyOutlets).mockResolvedValue([]);
    renderPage();
    await waitFor(() => screen.getByText(/outlets\.logout/i));
    await userEvent.click(screen.getByRole('button', { name: /outlets\.logout/i }));
    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
