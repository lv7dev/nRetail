import { useState } from 'react';

export function useHomeRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return {
    refetch: async () => {
      setIsRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsRefreshing(false);
    },
    isRefreshing,
  };
}
