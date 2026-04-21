import { apiClient } from '@/services/axios';
import type { Outlet } from '@/types/outlet';

export interface GetOutletsParams {
  connected: boolean;
  q?: string;
  cursor?: string;
}

export interface GetOutletsResponse {
  data: Outlet[];
  meta: {
    nextCursor: string | null;
  };
}

export const outletService = {
  getOutlets: async ({ connected, q, cursor }: GetOutletsParams): Promise<GetOutletsResponse> => {
    const res = await apiClient.get<GetOutletsResponse>('/outlets', {
      params: {
        connected,
        ...(q ? { q } : {}),
        ...(cursor ? { cursor } : {}),
      },
    });

    return res.data;
  },
};
