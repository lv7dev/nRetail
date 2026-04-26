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

export type UpdateMembershipAction = 'confirm' | 'reject';

export interface UpdateMembershipResponse {
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

type WrappedGetOutletsResponse = { data: GetOutletsResponse };

function unwrapGetOutletsResponse(
  response: GetOutletsResponse | WrappedGetOutletsResponse,
): GetOutletsResponse {
  if ('meta' in response) {
    return response;
  }

  return response.data;
}

export const outletService = {
  getOutlets: async ({ connected, q, cursor }: GetOutletsParams): Promise<GetOutletsResponse> => {
    const res = await apiClient.get<GetOutletsResponse | WrappedGetOutletsResponse>('/outlets', {
      params: {
        connected,
        ...(q ? { q } : {}),
        ...(cursor ? { cursor } : {}),
      },
    });

    return unwrapGetOutletsResponse(res.data);
  },

  updateMembership: async (
    outletId: string,
    action: UpdateMembershipAction,
  ): Promise<UpdateMembershipResponse> => {
    const res = await apiClient.patch<{ data: UpdateMembershipResponse }>(
      `/outlets/${outletId}/membership`,
      { action },
    );

    return res.data.data;
  },
};
