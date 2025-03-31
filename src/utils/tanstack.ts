import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true,
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
          console.error('Error in query:', error);
          // Global error handling here (e.g., Toast notification)
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          console.error('Error in mutation:', error);
          // Global error handling for mutations
        },
      }),
});