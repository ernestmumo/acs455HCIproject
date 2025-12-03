import { QueryClient } from '@tanstack/react-query';
import { get, set, del } from 'idb-keyval';

// Create a client
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute (Fetch fresh data on revisit if older than 1 min)
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days (Keep in cache for a week)
            retry: 2,
        },
    },
});

// Create an IndexedDB persister
// We need an async persister for IndexedDB, but createSyncStoragePersister expects synchronous storage (like localStorage).
// For IndexedDB (async), we should use 'createAsyncStoragePersister' if available, or build a custom one.
// Actually, @tanstack/react-query-persist-client exports `createAsyncStoragePersister` usually?
// Let's check the docs or use a custom interface.
// Wait, idb-keyval is async. The official docs recommend creating a persister object manually.

export const idbPersister = {
    persistClient: async (client: any) => {
        await set('REACT_QUERY_OFFLINE_CACHE', client);
    },
    restoreClient: async () => {
        return await get('REACT_QUERY_OFFLINE_CACHE');
    },
    removeClient: async () => {
        await del('REACT_QUERY_OFFLINE_CACHE');
    },
};

// Wait, the standard way is to pass a 'persister' object to PersistQueryClientProvider.
// The persister interface is { persistClient, restoreClient, removeClient }.
// So the object above is correct.

