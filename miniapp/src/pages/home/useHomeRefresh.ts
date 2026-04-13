import { useState } from 'react';

export function useHomeRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return {
    refetch: async () => {
      setIsRefreshing(true);
      console.log('here');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('done');
      setIsRefreshing(false);
    },
    isRefreshing,
  };
}
