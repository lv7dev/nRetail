import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { useAuthStore } from '@/store/useAuthStore';
import { useOutletStore } from '@/store/useOutletStore';

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

let intersectionCallback: IntersectionObserverCallback | undefined;

vi.stubGlobal(
  'IntersectionObserver',
  class {
    constructor(callback: IntersectionObserverCallback) {
      intersectionCallback = callback;
    }

    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
  },
);

import OutletListPage from './index';

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

describe('OutletListPage integration', () => {
  beforeEach(() => {
    vi.useRealTimers();
    mockNavigate.mockClear();
    intersectionCallback = undefined;
    useOutletStore.setState({ selectedOutlet: null });
    useAuthStore.setState({ user: null, isReady: true });
  });

  it('loads the Connected tab through GET /outlets?connected=true', async () => {
    const requests: string[] = [];

    server.use(
      http.get('*/outlets', ({ request }) => {
        requests.push(new URL(request.url).search);

        return HttpResponse.json({
          data: [
            {
              id: 'outlet-1',
              name: 'Main Store',
              code: 'CU000014603',
              address: '123 Main St',
              imageUrl: 'https://example.com/main-store.jpg',
              role: 'OWNER',
            },
            {
              id: 'outlet-2',
              name: 'Branch Store',
              code: 'CU000014604',
              address: '456 Branch Ave',
              imageUrl: null,
              role: 'MANAGER',
            },
          ],
          meta: {
            nextCursor: null,
          },
        });
      }),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    expect(requests).toContain('?connected=true');
  });

  it('loads the Not connected tab through GET /outlets?connected=false', async () => {
    const requests: string[] = [];

    server.use(
      http.get('*/outlets', ({ request }) => {
        const url = new URL(request.url);
        requests.push(url.search);

        if (url.searchParams.get('connected') === 'false') {
          return HttpResponse.json({
            data: [
              {
                id: 'outlet-3',
                name: 'Panda Shop',
                code: null,
                address: '789 Panda Ave',
                imageUrl: null,
                role: null,
              },
            ],
            meta: {
              nextCursor: null,
            },
          });
        }

        return HttpResponse.json({
          data: [
            {
              id: 'outlet-1',
              name: 'Main Store',
              code: 'CU000014603',
              address: '123 Main St',
              imageUrl: 'https://example.com/main-store.jpg',
              role: 'OWNER',
            },
            {
              id: 'outlet-2',
              name: 'Branch Store',
              code: 'CU000014604',
              address: '456 Branch Ave',
              imageUrl: null,
              role: 'MANAGER',
            },
          ],
          meta: {
            nextCursor: null,
          },
        });
      }),
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

    expect(requests).toContain('?connected=false');
  });

  it('sends the search parameter after the debounce window', async () => {
    const requests: string[] = [];

    server.use(
      http.get('*/outlets', ({ request }) => {
        const url = new URL(request.url);
        requests.push(url.search);

        const q = url.searchParams.get('q');
        const data =
          q === 'panda'
            ? [
                {
                  id: 'outlet-3',
                  name: 'Panda Shop',
                  code: null,
                  address: '789 Panda Ave',
                  imageUrl: null,
                  role: 'OWNER',
                },
              ]
            : [
                {
                  id: 'outlet-1',
                  name: 'Main Store',
                  code: 'CU000014603',
                  address: '123 Main St',
                  imageUrl: 'https://example.com/main-store.jpg',
                  role: 'OWNER',
                },
                {
                  id: 'outlet-2',
                  name: 'Branch Store',
                  code: 'CU000014604',
                  address: '456 Branch Ave',
                  imageUrl: null,
                  role: 'MANAGER',
                },
              ];

        return HttpResponse.json({
          data,
          meta: {
            nextCursor: null,
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('outlets.searchPlaceholder'), 'panda');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    await waitFor(() => {
      expect(screen.getByText('Panda Shop')).toBeInTheDocument();
    });

    expect(requests).toContain('?connected=true&q=panda');
  });

  it('fetches the next page when load-more is triggered', async () => {
    const requests: string[] = [];

    server.use(
      http.get('*/outlets', ({ request }) => {
        const url = new URL(request.url);
        requests.push(url.search);

        if (url.searchParams.get('cursor') === 'next-1') {
          return HttpResponse.json({
            data: [
              {
                id: 'outlet-3',
                name: 'Panda Shop',
                code: null,
                address: '789 Panda Ave',
                imageUrl: null,
                role: 'OWNER',
              },
            ],
            meta: {
              nextCursor: null,
            },
          });
        }

        return HttpResponse.json({
          data: [
            {
              id: 'outlet-1',
              name: 'Main Store',
              code: 'CU000014603',
              address: '123 Main St',
              imageUrl: 'https://example.com/main-store.jpg',
              role: 'OWNER',
            },
            {
              id: 'outlet-2',
              name: 'Branch Store',
              code: 'CU000014604',
              address: '456 Branch Ave',
              imageUrl: null,
              role: 'MANAGER',
            },
          ],
          meta: {
            nextCursor: 'next-1',
          },
        });
      }),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
      expect(screen.getByText('Branch Store')).toBeInTheDocument();
    });

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Panda Shop')).toBeInTheDocument();
    });

    expect(requests).toContain('?connected=true&cursor=next-1');
  });

  it('confirms a membership and refreshes both outlet queries', async () => {
    const requests: string[] = [];
    const patchBodies: unknown[] = [];
    let membershipStatus: 'PENDING' | 'CONFIRMED' = 'PENDING';

    server.use(
      http.get('*/outlets', ({ request }) => {
        const url = new URL(request.url);
        requests.push(url.search);

        if (url.searchParams.get('connected') === 'false') {
          return HttpResponse.json({
            data:
              membershipStatus === 'PENDING'
                ? [
                    {
                      id: 'outlet-3',
                      name: 'Panda Shop',
                      code: null,
                      address: '789 Panda Ave',
                      imageUrl: null,
                      role: null,
                      membershipStatus: 'PENDING',
                    },
                  ]
                : [],
            meta: {
              nextCursor: null,
            },
          });
        }

        return HttpResponse.json({
          data: [
            {
              id: 'outlet-1',
              name: 'Main Store',
              code: 'CU000014603',
              address: '123 Main St',
              imageUrl: 'https://example.com/main-store.jpg',
              role: 'OWNER',
            },
            {
              id: 'outlet-2',
              name: 'Branch Store',
              code: 'CU000014604',
              address: '456 Branch Ave',
              imageUrl: null,
              role: 'MANAGER',
            },
            ...(membershipStatus === 'CONFIRMED'
              ? [
                  {
                    id: 'outlet-3',
                    name: 'Panda Shop',
                    code: null,
                    address: '789 Panda Ave',
                    imageUrl: null,
                    role: 'MANAGER',
                  },
                ]
              : []),
          ],
          meta: {
            nextCursor: null,
          },
        });
      }),
      http.patch('*/outlets/:outletId/membership', async ({ request }) => {
        patchBodies.push(await request.json());
        membershipStatus = 'CONFIRMED';

        return HttpResponse.json({
          status: 'CONFIRMED',
        });
      }),
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

    await user.click(screen.getByRole('button', { name: 'outlets.connect' }));

    await waitFor(() => {
      expect(patchBodies).toEqual([{ action: 'confirm' }]);
    });

    await waitFor(() => {
      expect(requests.filter((search) => search === '?connected=false').length).toBeGreaterThan(1);
      expect(screen.getByText('outlets.noResults')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'outlets.connectedTab' }));

    await waitFor(() => {
      expect(screen.getByText('Panda Shop')).toBeInTheDocument();
    });
  });

  it('rejects a membership and refreshes the not-connected query', async () => {
    const requests: string[] = [];
    const patchBodies: unknown[] = [];
    let membershipStatus: 'PENDING' | 'REJECTED' = 'PENDING';

    server.use(
      http.get('*/outlets', ({ request }) => {
        const url = new URL(request.url);
        requests.push(url.search);

        if (url.searchParams.get('connected') === 'false') {
          return HttpResponse.json({
            data: [
              {
                id: 'outlet-3',
                name: 'Panda Shop',
                code: null,
                address: '789 Panda Ave',
                imageUrl: null,
                role: null,
                membershipStatus,
              },
            ],
            meta: {
              nextCursor: null,
            },
          });
        }

        return HttpResponse.json({
          data: [
            {
              id: 'outlet-1',
              name: 'Main Store',
              code: 'CU000014603',
              address: '123 Main St',
              imageUrl: 'https://example.com/main-store.jpg',
              role: 'OWNER',
            },
            {
              id: 'outlet-2',
              name: 'Branch Store',
              code: 'CU000014604',
              address: '456 Branch Ave',
              imageUrl: null,
              role: 'MANAGER',
            },
          ],
          meta: {
            nextCursor: null,
          },
        });
      }),
      http.patch('*/outlets/:outletId/membership', async ({ request }) => {
        patchBodies.push(await request.json());
        membershipStatus = 'REJECTED';

        return HttpResponse.json({
          status: 'REJECTED',
        });
      }),
    );

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'outlets.notConnectedTab' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'outlets.notMyOutlet' })).toBeInTheDocument();
    });

    const initialConnectedRequests = requests.filter(
      (search) => search === '?connected=true',
    ).length;
    const initialNotConnectedRequests = requests.filter(
      (search) => search === '?connected=false',
    ).length;

    await user.click(screen.getByRole('button', { name: 'outlets.notMyOutlet' }));

    await waitFor(() => {
      expect(patchBodies).toEqual([{ action: 'reject' }]);
    });

    await waitFor(() => {
      expect(requests.filter((search) => search === '?connected=false').length).toBeGreaterThan(
        initialNotConnectedRequests,
      );
    });

    expect(requests.filter((search) => search === '?connected=true').length).toBe(
      initialConnectedRequests,
    );
    expect(screen.queryByRole('button', { name: 'outlets.notMyOutlet' })).not.toBeInTheDocument();
  });
});
