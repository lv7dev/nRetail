import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { useOutletStore } from '@/store/useOutletStore';
import { useAuthStore } from '@/store/useAuthStore';

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

describe('OutletListPage integration', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useOutletStore.setState({ selectedOutlet: null });
    useAuthStore.setState({ user: null, isReady: true });
  });

  it('shows empty state when 0 outlets returned', async () => {
    server.use(
      http.get('*/outlets/mine', () => {
        return HttpResponse.json({ data: [] });
      }),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/outlets\.noOutlets/i)).toBeInTheDocument();
    });
  });

  it('auto-navigates to / when 1 outlet returned', async () => {
    server.use(
      http.get('*/outlets/mine', () => {
        return HttpResponse.json({
          data: [{ id: 'outlet-1', name: 'Only Store', address: null, role: 'OWNER' }],
        });
      }),
    );

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('renders outlet list when 2 outlets returned', async () => {
    // Default handler in handlers/outlets.ts returns 2 outlets
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
      expect(screen.getByText('Branch Store')).toBeInTheDocument();
    });
  });
});
