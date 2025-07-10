import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'

import App from './App'
import { store, persistor } from './store'
import LoadingSpinner from './components/common/LoadingSpinner'
import ErrorFallback from './components/common/ErrorFallback'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import './index.css'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <HelmetProvider>
                <Routes>
                  <Route path="/*" element={<App />} />
                </Routes>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 4000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </HelmetProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)
