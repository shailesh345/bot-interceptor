import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Toaster } from 'react-hot-toast';

// Import all slices - using proper imports
import authSlice from '../store/slices/authSlice';
import uiSlice from '../store/slices/uiSlice';
import domainsSlice from '../store/slices/domainsSlice';
import rulesSlice from '../store/slices/rulesSlice';
import analyticsSlice from '../store/slices/analyticsSlice';
import billingSlice from '../store/slices/billingSlice';
import dashboardSlice from '../store/slices/dashboardSlice';
import userSlice from '../store/slices/userSlice';
import adminSlice from '../store/slices/adminSlice';

// Create a properly configured test store
export function createTestStore(preloadedState = {}) {
  const defaultState = {
    auth: {
      user: {
        id: 'user_1234567890',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        isVerified: true,
        createdAt: '2024-01-15T10:30:00Z',
        lastLogin: new Date().toISOString(),
        tenant: {
          id: 'tenant_1234567890',
          name: "Test Organization",
          slug: 'test-org',
          status: 'active',
          createdAt: '2024-01-15T10:30:00Z',
        },
      },
      token: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      isAuthenticated: true,
      loading: false,
      error: null,
    },
    ui: {
      sidebarOpen: false,
      theme: 'light',
      notifications: [],
      loading: false,
      currentPage: 'dashboard',
      breadcrumbs: [],
      modals: {
        addDomain: false,
        addRule: false,
        billing: false,
        profile: false,
      },
    },
    domains: {
      domains: [],
      loading: false,
      error: null,
      filters: { search: '', status: 'all' }
    },
    rules: {
      rules: [],
      loading: false,
      error: null,
      templates: []
    },
    analytics: {
      traffic: { total: 0, today: 0 },
      bots: { total: 0, blocked: 0 },
      revenue: { total: 0, today: 0 },
      loading: false,
      error: null
    },
    billing: {
      subscription: null,
      invoices: [],
      loading: false,
      error: null
    },
    dashboard: {
      metrics: {},
      loading: false,
      error: null
    },
    user: {
      profile: null,
      loading: false,
      error: null
    },
    admin: {
      clients: [],
      loading: false,
      error: null
    }
  };

  // Merge with provided state
  const finalState = {
    ...defaultState,
    ...preloadedState,
    // Ensure auth state is properly merged
    auth: {
      ...defaultState.auth,
      ...(preloadedState.auth || {})
    },
    ui: {
      ...defaultState.ui,
      ...(preloadedState.ui || {})
    }
  };

  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
      domains: domainsSlice.reducer,
      rules: rulesSlice.reducer,
      analytics: analyticsSlice.reducer,
      billing: billingSlice.reducer,
      dashboard: dashboardSlice.reducer,
      user: userSlice.reducer,
      admin: adminSlice.reducer,
    },
    preloadedState: finalState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
  });
}

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
      <Provider store={store}>
        <BrowserRouter>
          {children}
          <Toaster />
        </BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock user states for different scenarios
export const mockAuthenticatedUser = {
  id: 'user_1234567890',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
  isVerified: true,
  createdAt: '2024-01-15T10:30:00Z',
  lastLogin: new Date().toISOString(),
  tenant: {
    id: 'tenant_1234567890',
    name: "Test Organization",
    slug: 'test-org',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
  },
};

export const mockUnauthenticatedState = {
  auth: {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
