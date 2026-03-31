import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Outlet } from '@/types/outlet';

interface OutletState {
  selectedOutlet: Outlet | null;
  setSelectedOutlet: (outlet: Outlet) => void;
  clearSelectedOutlet: () => void;
}

export const useOutletStore = create<OutletState>()(
  persist(
    (set) => ({
      selectedOutlet: null,
      setSelectedOutlet: (outlet) => set({ selectedOutlet: outlet }),
      clearSelectedOutlet: () => set({ selectedOutlet: null }),
    }),
    { name: 'outlet-storage' },
  ),
);
