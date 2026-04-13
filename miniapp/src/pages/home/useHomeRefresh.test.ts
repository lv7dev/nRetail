import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHomeRefresh } from './useHomeRefresh';

describe('useHomeRefresh', () => {
  it('returns a refetch function', async () => {
    const { result } = renderHook(() => useHomeRefresh());

    await expect(result.current.refetch()).resolves.toBeUndefined();
  });

  it('sets isRefreshing while refetch is running and resets it afterwards', async () => {
    const { result } = renderHook(() => useHomeRefresh());

    let refetchPromise: Promise<void> | undefined;
    await act(async () => {
      refetchPromise = result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(true);
    });

    await act(async () => {
      await refetchPromise;
    });

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });
  });
});
