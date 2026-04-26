import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { outletService } from '@/services/outletService';
import type { Outlet, OutletTabKey } from '@/types/outlet';
import { useOutlets } from './useOutlets';

vi.mock('@/services/outletService');

const connectedOutlet: Outlet = {
  id: 'outlet-1',
  name: 'Main Store',
  code: 'CU000014603',
  address: '123 Main St',
  imageUrl: null,
  role: 'OWNER',
};

const connectedOutletPage2: Outlet = {
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
  membershipStatus: 'PENDING',
};

function createResponse(data: Outlet[], nextCursor: string | null = null) {
  return {
    data,
    meta: {
      nextCursor,
    },
  };
}

function createWrapper(
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

function renderUseOutlets(activeTab: OutletTabKey, searchTerm = '') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return {
    queryClient,
    ...renderHook(
      ({ tab, q }) =>
        useOutlets({
          activeTab: tab,
          searchTerm: q,
        }),
      {
        initialProps: { tab: activeTab, q: searchTerm },
        wrapper: createWrapper(queryClient),
      },
    ),
  };
}

function matchesConnected(predicate: (query: unknown) => boolean, connected: boolean) {
  return predicate({ queryKey: ['outlets', { connected, q: undefined }] });
}

describe('useOutlets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(outletService.getOutlets).mockImplementation(async ({ connected, cursor }) => {
      if (connected && cursor === 'page-2') {
        return createResponse([connectedOutletPage2]);
      }

      return connected
        ? createResponse([connectedOutlet], 'page-2')
        : createResponse([notConnectedOutlet]);
    });
  });

  it('enables only the connected query on the connected tab', async () => {
    const { result } = renderUseOutlets('connected');

    await waitFor(() => {
      expect(result.current.connectedOutlets).toEqual([connectedOutlet]);
    });

    expect(vi.mocked(outletService.getOutlets)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(outletService.getOutlets)).toHaveBeenCalledWith({
      connected: true,
      q: undefined,
      cursor: undefined,
    });
    expect(result.current.notConnectedQuery.fetchStatus).toBe('idle');
  });

  it('enables only the not-connected query on the not-connected tab', async () => {
    const { result } = renderUseOutlets('not-connected');

    await waitFor(() => {
      expect(result.current.notConnectedOutlets).toEqual([notConnectedOutlet]);
    });

    expect(vi.mocked(outletService.getOutlets)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(outletService.getOutlets)).toHaveBeenCalledWith({
      connected: false,
      q: undefined,
      cursor: undefined,
    });
    expect(result.current.connectedQuery.fetchStatus).toBe('idle');
  });

  it('returns flattened outlet arrays from all loaded pages', async () => {
    const { result } = renderUseOutlets('connected');

    await waitFor(() => {
      expect(result.current.connectedOutlets).toEqual([connectedOutlet]);
    });

    await act(async () => {
      await result.current.connectedQuery.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.connectedOutlets).toEqual([connectedOutlet, connectedOutletPage2]);
    });
  });

  it('returns hasSearch and sends non-empty search through the query key', async () => {
    const { result } = renderUseOutlets('connected', 'main');

    await waitFor(() => {
      expect(result.current.hasSearch).toBe(true);
    });

    expect(vi.mocked(outletService.getOutlets)).toHaveBeenCalledWith({
      connected: true,
      q: 'main',
      cursor: undefined,
    });
  });

  it('invalidates both outlet query groups after confirming membership', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(outletService.updateMembership).mockResolvedValue({ status: 'CONFIRMED' });

    const { result } = renderHook(
      () => useOutlets({ activeTab: 'not-connected', searchTerm: '' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.notConnectedOutlets).toEqual([notConnectedOutlet]);
    });

    act(() => {
      result.current.handleMembershipAction('outlet-3', 'confirm');
    });

    await waitFor(() => {
      expect(outletService.updateMembership).toHaveBeenCalledWith('outlet-3', 'confirm');
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
    });

    const predicates = invalidateQueriesSpy.mock.calls.map((call) => call[0]?.predicate);

    expect(matchesConnected(predicates[0]!, true)).toBe(true);
    expect(matchesConnected(predicates[0]!, false)).toBe(false);
    expect(matchesConnected(predicates[1]!, false)).toBe(true);
    expect(matchesConnected(predicates[1]!, true)).toBe(false);
  });

  it('invalidates only not-connected outlet queries after rejecting membership', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(outletService.updateMembership).mockResolvedValue({ status: 'REJECTED' });

    const { result } = renderHook(
      () => useOutlets({ activeTab: 'not-connected', searchTerm: '' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.notConnectedOutlets).toEqual([notConnectedOutlet]);
    });

    act(() => {
      result.current.handleMembershipAction('outlet-3', 'reject');
    });

    await waitFor(() => {
      expect(outletService.updateMembership).toHaveBeenCalledWith('outlet-3', 'reject');
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    });

    const predicate = invalidateQueriesSpy.mock.calls[0][0]?.predicate;

    expect(matchesConnected(predicate!, false)).toBe(true);
    expect(matchesConnected(predicate!, true)).toBe(false);
  });
});
