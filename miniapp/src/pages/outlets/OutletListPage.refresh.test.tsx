import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOutlets } from '@/hooks/useOutlets';
import { useAuthStore } from '@/store/useAuthStore';
import { useOutletStore } from '@/store/useOutletStore';
import type { Outlet } from '@/types/outlet';

interface MockPanelProps {
  children: React.ReactNode;
  tabKey: string;
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

vi.mock('@/hooks/useOutlets');
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

const { panelMock } = vi.hoisted(() => ({
  panelMock: vi.fn(({ children }: MockPanelProps) => (
    <section data-testid="tabbed-view-panel">{children}</section>
  )),
}));

vi.mock('@/components/shared', () => {
  const TabbedView = Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    {
      Panel: panelMock,
      Panels: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      TabBar: () => <div />,
    },
  );

  return {
    CollapsibleHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabbedView,
  };
});

vi.mock('@/components/ui', () => ({
  AppHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Icon: ({ name, className }: { name: string; className?: string }) => (
    <svg data-testid={`icon-${name}`} className={className} aria-hidden="true" />
  ),
  SearchInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

import OutletListPage from './index';

const connectedOutlet: Outlet = {
  id: 'outlet-1',
  name: 'Main Store',
  code: 'CU000014603',
  address: '123 Main St',
  imageUrl: null,
  role: 'OWNER',
};

const notConnectedOutlet: Outlet = {
  id: 'outlet-2',
  name: 'Panda Shop',
  code: null,
  address: '789 Panda Ave',
  imageUrl: null,
  role: null,
  membershipStatus: 'PENDING',
};

const connectedRefetch = vi.fn();
const notConnectedRefetch = vi.fn();

function createQuery(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    isPending: false,
    isFetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  };
}

function mockUseOutlets({
  connectedQuery = createQuery({ refetch: connectedRefetch }),
  notConnectedQuery = createQuery({ refetch: notConnectedRefetch }),
}: {
  connectedQuery?: ReturnType<typeof createQuery>;
  notConnectedQuery?: ReturnType<typeof createQuery>;
} = {}) {
  vi.mocked(useOutlets).mockReturnValue({
    connectedQuery,
    notConnectedQuery,
    connectedOutlets: [connectedOutlet],
    notConnectedOutlets: [notConnectedOutlet],
    hasSearch: true,
    handleMembershipAction: vi.fn(),
  } as unknown as ReturnType<typeof useOutlets>);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <OutletListPage />
    </MemoryRouter>,
  );
}

function getPanelProps(tabKey: string) {
  const calls = panelMock.mock.calls as Array<[MockPanelProps]>;
  const call = calls.find(([props]) => props.tabKey === tabKey);
  expect(call).toBeDefined();
  return call![0];
}

describe('OutletListPage pull-to-refresh wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    vi.mocked(useOutletStore).mockReturnValue({
      selectedOutlet: null,
      setSelectedOutlet: vi.fn(),
      clearSelectedOutlet: vi.fn(),
    } as ReturnType<typeof useOutletStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isReady: true,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    } as ReturnType<typeof useAuthStore>);

    mockUseOutlets();
  });

  it('passes refresh handlers that refetch the matching outlet query', () => {
    renderPage();

    const connectedOnRefresh = getPanelProps('connected').onRefresh;
    const notConnectedOnRefresh = getPanelProps('not-connected').onRefresh;
    expect(connectedOnRefresh).toBeTypeOf('function');
    expect(notConnectedOnRefresh).toBeTypeOf('function');

    connectedOnRefresh?.();
    notConnectedOnRefresh?.();

    expect(connectedRefetch).toHaveBeenCalledTimes(1);
    expect(notConnectedRefetch).toHaveBeenCalledTimes(1);
  });

  it('marks connected panel refreshing only when it is fetching without next-page loading', () => {
    mockUseOutlets({
      connectedQuery: createQuery({
        refetch: connectedRefetch,
        isFetching: true,
        isFetchingNextPage: false,
      }),
      notConnectedQuery: createQuery({
        refetch: notConnectedRefetch,
        isFetching: true,
        isFetchingNextPage: true,
      }),
    });

    renderPage();

    expect(getPanelProps('connected').isRefreshing).toBe(true);
    expect(getPanelProps('not-connected').isRefreshing).toBe(false);
  });

  it('marks not-connected panel refreshing only when it is fetching without next-page loading', () => {
    mockUseOutlets({
      connectedQuery: createQuery({
        refetch: connectedRefetch,
        isFetching: true,
        isFetchingNextPage: true,
      }),
      notConnectedQuery: createQuery({
        refetch: notConnectedRefetch,
        isFetching: true,
        isFetchingNextPage: false,
      }),
    });

    renderPage();

    expect(getPanelProps('connected').isRefreshing).toBe(false);
    expect(getPanelProps('not-connected').isRefreshing).toBe(true);
  });
});
