import { describe, it, expect, beforeEach } from 'vitest';
import { useOutletStore } from './useOutletStore';
import type { Outlet } from '@/types/outlet';

const mockOutlet: Outlet = {
  id: 'outlet-1',
  name: 'Main Store',
  address: '123 Main St',
  role: 'OWNER',
};

describe('useOutletStore', () => {
  beforeEach(() => {
    useOutletStore.setState({ selectedOutlet: null });
  });

  it('has null selectedOutlet initially', () => {
    const { selectedOutlet } = useOutletStore.getState();
    expect(selectedOutlet).toBeNull();
  });

  it('setSelectedOutlet sets the outlet', () => {
    useOutletStore.getState().setSelectedOutlet(mockOutlet);
    expect(useOutletStore.getState().selectedOutlet).toEqual(mockOutlet);
  });

  it('clearSelectedOutlet resets to null', () => {
    useOutletStore.setState({ selectedOutlet: mockOutlet });
    useOutletStore.getState().clearSelectedOutlet();
    expect(useOutletStore.getState().selectedOutlet).toBeNull();
  });

  it('uses the correct localStorage key outlet-storage', () => {
    // The persist middleware stores under the key specified in { name: 'outlet-storage' }
    // We verify this by checking the store's persist options
    const { persist } = useOutletStore as unknown as {
      persist: { getOptions: () => { name: string } };
    };
    expect(persist.getOptions().name).toBe('outlet-storage');
  });
});
