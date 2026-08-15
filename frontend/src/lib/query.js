import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// react tanstack-query for data fetching and caching - saolving the single source of truth problem in react apps.


// staleTime : the time in milliseconds that the data is considered fresh. 
// During this time, React Query will not refetch the data when components 
// mount or when the window is refocused. After this time, the data becomes stale 
// and will be refetched on the next mount or window focus.


// gtTime : the time in milliseconds that unused or inactive data remains in the cache before being garbage collected.
//  after this time, the data will be removed from the cache if there are no active subscribers (components using the data).


// retry : the number of times React Query will retry a failed query before throwing an error.

// refetchOnWindowFocus : a boolean that determines whether React Query should refetch the data when the window regains focus.
// i.e. if the user switches to another tab and then comes back, React Query will refetch the data if this is set to true.


export const queryClient = new QueryClient(
    {
        defaultOptions: {
            queries : {
                staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
                gcTime: 1000 * 60 * 10, // Data is garbage collected after 10 minutes
                retry: 1,    // Retry failed requests once before showing an errors
                refetchOnWindowFocus: false, // Don't refetch on window focus
            },
            mutations : {
                retry: 1, // Retry failed mutations once before showing an error
            },
        },
    }
);