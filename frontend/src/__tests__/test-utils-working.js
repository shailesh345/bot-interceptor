import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

// Import actual slice reducers
import authReducer from '../store/slices/authSlice'
import uiReducer from '../store/slices/uiSlice'
import domainsReducer from '../store/slices/domainsSlice'
import rulesReducer from '../store/slices/rulesSlice'
import analyticsReducer from '../store/slices/analyticsSlice'
import billingReducer from '../store/slices/billingSlice'
import dashboardReducer from '../store/slices/dashboardSlice'
import userReducer from '../store/slices/userSlice'
import adminReducer from '../store/slices/adminSlice'

// Create a function that creates a test store with proper reducers
export function createTestStore(preloadedState = {}) {
  const defaultState = {
    auth: {
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      },
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    },
    ui: {
      sidebarOpen: true,
      theme: 'light',
      notifications: [],
    },
    domains: {
      domains: [],
      loading: false,
      error: null,
    },
    rules: {
      rules: [],
      loading: false,
      error: null,
    },
    analytics: {
      traffic: [],
      botsBlocked: 0,
      threatsBlocked: 0,
      loading: false,
      error: null,
    },
    billing: {
      currentPlan: 'pro',
      usage: {},
      loading: false,
      error: null,
    },
    dashboard: {
      metrics: {
        totalTraffic: 15420,
        botsBlocked: 2340,
        threatsBlocked: 150,
        revenue: 1250.75
      },
      charts: {
        traffic: [
          { name: 'Jan', requests: 4000, blocked: 2400 },
          { name: 'Feb', requests: 9889, blocked: 1398 },
          { name: 'Mar', requests: 2000, blocked: 800 },
          { name: 'Apr', requests: 2780, blocked: 3908 },
          { name: 'May', requests: 1890, blocked: 4800 },
          { name: 'Jun', requests: 2390, blocked: 3800 }
        ],
        botDistribution: [
          { name: 'Good Bots', value: 65, color: '#0088FE' },
          { name: 'Bad Bots', value: 25, color: '#00C49F' },
          { name: 'Unknown', value: 10, color: '#FFBB28' }
        ]
      },
      alerts: [
        {
          id: 1,
          message: 'High traffic detected',
          severity: 'warning',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          message: 'Bot attack blocked',
          severity: 'success',
          timestamp: new Date().toISOString()
        }
      ],
      autoRefresh: true,
      refreshInterval: 98890,
      loading: false,
      error: null,
    },
    user: {
      profile: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      },
      preferences: {},
      loading: false,
      error: null,
    },
    admin: {
      users: [],
      systemStats: {},
      loading: false,
      error: null,
    },
    ...preloadedState,
  }

  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      domains: domainsReducer,
      rules: rulesReducer,
      analytics: analyticsReducer,
      billing: billingReducer,
      dashboard: dashboardReducer,
      user: userReducer,
      admin: adminReducer,
    },
    preloadedState: defaultState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
  })
}

// Custom render function that wraps components with providers
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <HelmetProvider>
        <Provider store={store}>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </Provider>
      </HelmetProvider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Mock user states for different scenarios
export const mockUserStates = {
  authenticatedAdmin: {
    auth: {
      user: {
        id: '123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      },
      token: 'admin-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    },
  },
  authenticatedUser: {
    auth: {
      user: {
        id: '456',
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
      },
      token: 'user-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    },
  },
  unauthenticated: {
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    },
  },
  loading: {
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,
      error: null,
    },
  },
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }
