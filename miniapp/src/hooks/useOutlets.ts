import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  outletService,
  type GetOutletsResponse,
  type UpdateMembershipAction,
} from '@/services/outletService';
import type { Outlet, OutletTabKey } from '@/types/outlet';

interface UseOutletsParams {
  activeTab: OutletTabKey;
  searchTerm: string;
}

function flattenPages(pages: GetOutletsResponse[] | undefined): Outlet[] {
  return pages?.flatMap((page) => page.data) ?? [];
}

export function useOutlets({ activeTab, searchTerm }: UseOutletsParams) {
  const queryClient = useQueryClient();
  const querySearchTerm = searchTerm || undefined;

  const connectedQuery = useInfiniteQuery({
    queryKey: ['outlets', { connected: true, q: querySearchTerm }],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      outletService.getOutlets({
        connected: true,
        q: querySearchTerm,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    enabled: activeTab === 'connected',
    retry: false,
    staleTime: 1 * 60 * 1000,
  });

  const notConnectedQuery = useInfiniteQuery({
    queryKey: ['outlets', { connected: false, q: querySearchTerm }],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      outletService.getOutlets({
        connected: false,
        q: querySearchTerm,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    enabled: activeTab === 'not-connected',
    retry: false,
    staleTime: 1 * 60 * 1000,
  });

  const invalidateOutletQuery = (connected: boolean) =>
    queryClient.invalidateQueries({
      refetchType: 'all',
      predicate: (query) => {
        const [scope, params] = query.queryKey;
        return (
          scope === 'outlets' &&
          typeof params === 'object' &&
          params !== null &&
          'connected' in params &&
          params.connected === connected
        );
      },
    });

  const confirmMembershipMutation = useMutation({
    mutationFn: (outletId: string) => outletService.updateMembership(outletId, 'confirm'),
    onSuccess: async () => {
      await Promise.all([invalidateOutletQuery(true), invalidateOutletQuery(false)]);
    },
  });

  const rejectMembershipMutation = useMutation({
    mutationFn: (outletId: string) => outletService.updateMembership(outletId, 'reject'),
    onSuccess: async () => {
      await invalidateOutletQuery(false);
    },
  });

  const handleMembershipAction = (outletId: string, action: UpdateMembershipAction) => {
    if (action === 'confirm') {
      confirmMembershipMutation.mutate(outletId);
      return;
    }

    rejectMembershipMutation.mutate(outletId);
  };

  return {
    connectedQuery,
    notConnectedQuery,
    connectedOutlets: flattenPages(connectedQuery.data?.pages),
    notConnectedOutlets: flattenPages(notConnectedQuery.data?.pages),
    hasSearch: searchTerm.length > 0,
    handleMembershipAction,
  };
}
