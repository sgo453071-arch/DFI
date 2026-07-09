import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,       // 30 seconds global default — short enough to feel live
      gcTime:    5 * 60 * 1000,   // keep unused cache in memory for 5 min (for back-nav)
      retry: 1,
      refetchOnWindowFocus: true, // always re-check when user returns to the tab
    },
  },
});

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('[GlobalError]', event.error);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[UnhandledRejection]', event.reason);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>
);