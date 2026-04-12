import { describe, expect, it } from 'vitest';
import { useHomeRefresh } from './useHomeRefresh';

describe('useHomeRefresh', () => {
  it('returns a refetch function', async () => {
    const { refetch } = useHomeRefresh();
    await expect(refetch()).resolves.toBeUndefined();
  });
});
