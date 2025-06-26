import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      gcTime: 1000 * 60 * 10, 
      retry: (failureCount, error: any) => {
        
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

