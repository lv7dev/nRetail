import { apiClient } from '@/services/axios';
import type { Outlet } from '@/types/outlet';

export const outletService = {
  getMyOutlets: async (): Promise<Outlet[]> => {
    const res = await apiClient.get<{ data: Outlet[] }>('/outlets/mine');
    return res.data.data;
  },
};
