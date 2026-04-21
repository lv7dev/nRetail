import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { outletService } from '@/services/outletService';
import { useAuthStore } from '@/store/useAuthStore';
import { useOutletStore } from '@/store/useOutletStore';
import type { Outlet } from '@/types/outlet';

vi.mock('@/services/outletService');
vi.mock('@/store/useOutletStore');
vi.mock('@/store/useAuthStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual<typeof import('@/components/ui')>('@/components/ui');

  return {
    ...actual,
    Icon: ({ name, className }: { name: string; className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className} aria-hidden="true" />
    ),
  };
});

vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
  },
);

import OutletListPage from './index';

const connectedOutlet1: Outlet = {
  id: 'outlet-1',
  name: 'Main Store',
  code: 'CU000014603',
  address: '123 Main St',
  imageUrl: 'https://example.com/main-store.jpg',
  role: 'OWNER',
};

const connectedOutlet2: Outlet = {
  id: 'outlet-2',
  name: 'Branch Store',
  code: 'CU000014604',
  address: '456 Branch Ave',
  imageUrl: null,
  role: 'MANAGER',
};

const notConnectedOutlet: Outlet = {
  id: 'outlet-3',
  name: 'Panda Shop',
  code: null,
  address: '789 Panda Ave',
  imageUrl: null,
  role: null,
};

const mockSetSelectedOutlet = vi.fn();
const mockClearAuth = vi.fn();

function createResponse(data: Outlet[], nextCursor: string | null = null) {
  return {
    data,
    meta: {
      nextCursor,
    },
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
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

function renderPageWithHistory() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/', '/outlets']} initialIndex={1}>
        <OutletListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OutletListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
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

  it('switches between Connected and Not connected tabs', async () => {
    vi.mocked(outletService.getOutlets).mockImplementation(async ({ connected }) =>
      connected
        ? createResponse([connectedOutlet1, connectedOutlet2])
        : createResponse([notConnectedOutlet]),
    );

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'outlets.notConnectedTab' }));

    await waitFor(() => {
      expect(screen.getByText('Panda Shop')).toBeInTheDocument();
    });
  });

  it('sends the debounced search value to the active tab query', async () => {
    vi.mocked(outletService.getOutlets).mockImplementation(async ({ connected, q }) => {
      if (!connected) {
        return createResponse([notConnectedOutlet]);
      }

      if (q === 'main') {
        return createResponse([connectedOutlet1]);
      }

      return createResponse([connectedOutlet1, connectedOutlet2]);
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('outlets.searchPlaceholder'), 'main');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    await waitFor(() => {
      expect(vi.mocked(outletService.getOutlets)).toHaveBeenCalledWith({
        connected: true,
        q: 'main',
        cursor: undefined,
      });
    });
  });

  it('suppresses auto-forward when a search returns exactly one connected outlet', async () => {
    vi.mocked(outletService.getOutlets).mockImplementation(async ({ connected, q }) => {
      if (!connected) {
        return createResponse([notConnectedOutlet]);
      }

      if (q === 'main') {
        return createResponse([connectedOutlet1]);
      }

      return createResponse([connectedOutlet1, connectedOutlet2]);
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Branch Store')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('outlets.searchPlaceholder'), 'main');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    expect(mockSetSelectedOutlet).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith('/', { replace: true });
  });

  it('shows the empty state only when the connected tab has no outlets and no search term', async () => {
    vi.mocked(outletService.getOutlets).mockImplementation(async ({ connected }) =>
      connected ? createResponse([]) : createResponse([notConnectedOutlet]),
    );

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('outlets.emptyStateTitle')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'outlets.logout' }));

    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('does not show a back arrow when arriving via initial navigation', async () => {
    vi.mocked(outletService.getOutlets).mockResolvedValue(
      createResponse([connectedOutlet1, connectedOutlet2]),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'common:button.back' })).not.toBeInTheDocument();
  });

  it('shows a back arrow when navigated from a previous route', async () => {
    vi.mocked(outletService.getOutlets).mockResolvedValue(
      createResponse([connectedOutlet1, connectedOutlet2]),
    );

    renderPageWithHistory();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'common:button.back' })).toBeInTheDocument();
  });

  it('calls navigate(-1) when the back arrow is clicked', async () => {
    vi.mocked(outletService.getOutlets).mockResolvedValue(
      createResponse([connectedOutlet1, connectedOutlet2]),
    );

    const user = userEvent.setup();
    renderPageWithHistory();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'common:button.back' }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('shows a no-results state instead of the empty state when searching returns no outlets', async () => {
    vi.mocked(outletService.getOutlets).mockImplementation(async ({ connected, q }) => {
      if (!connected) {
        return createResponse([notConnectedOutlet]);
      }

      if (q === 'zzz') {
        return createResponse([]);
      }

      return createResponse([connectedOutlet1, connectedOutlet2]);
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('outlets.searchPlaceholder'), 'zzz');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    await waitFor(() => {
      expect(screen.getByText('outlets.noResults')).toBeInTheDocument();
    });

    expect(screen.queryByText('outlets.emptyStateTitle')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'outlets.logout' })).not.toBeInTheDocument();
  });
});
