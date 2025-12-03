import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/tokens.css' // Import Design Tokens
import App from './App.tsx'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, idbPersister } from './utils/queryClient'
import { ErrorBoundary } from './components/ErrorBoundary'
import './i18n'; // Import i18n config

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: idbPersister }}
      >
        <App />
      </PersistQueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
