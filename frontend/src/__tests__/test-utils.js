import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Toaster } from 'react-hot-toast';

// Import all slices
import authSlice from '../store/slices/authSlice';
import uiSlice from '../store/slices/uiSlice';
import domainsSlice from '../store/slices/domainsSlice';
import rulesSlice from '../store/slices/rulesSlice';
import analyticsSlice from '../store/slices/analyticsSlice';
import billingSlice from '../store/slices/billingSlice';
import dashboardSlice from '../store/slices/dashboardSlice';
import userSlice from '../store/slices/userSlice';
import adminSlice from '../store/slices/adminSlice';

export function createTestStore(preloadedState) {
  return configureStore({
    reducer: {
      auth: authSlice,
      ui: uiSlice,
      domains: domainsSlice,
      rules: rulesSlice,
      analytics: analyticsSlice,
      billing: billingSlice,
      dashboard: dashboardSlice,
      user: userSlice,
      admin: adminSlice,
    },
    preloadedState,
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
    preloadedState = {
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
      }
    },
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

// Mock user states
export const mockAuthenticatedUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  subscription: 'pro',
  isActive: true,
};

export const mockAdminUser = {
  id: '2',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
  subscription: 'enterprise',
  isActive: true,
};

export const mockSuperAdminUser = {
  id: '3',
  email: 'superadmin@example.com',
  name: 'Super Admin',
  role: 'superadmin',
  subscription: 'enterprise',
  isActive: true,
};

// Mock initial states
export const mockInitialAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const mockAuthenticatedState = {
  user: mockAuthenticatedUser,
  token: 'mock-jwt-token',
  isAuthenticated: true,
  loading: false,
  error: null,
};

export const mockDomainsState = {
  domains: [
    {
      id: '1',
      domain: 'example.com',
      status: 'verified',
      trafficCount: 15420,
      botCount: 2341,
      revenue: 4200.50,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      domain: 'test.com',
      status: 'pending',
      trafficCount: 0,
      botCount: 0,
      revenue: 0,
      createdAt: '2024-01-20T14:15:00Z',
    },
  ],
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

export const mockRulesState = {
  rules: [
    {
      id: '1',
      name: 'Block Suspicious Bots',
      description: 'Blocks bots with suspicious patterns',
      conditions: [
        { field: 'userAgent', operator: 'contains', value: 'bot' },
        { field: 'requestRate', operator: 'greaterThan', value: 100 },
      ],
      actions: [
        { type: 'block', status: 403 },
        { type: 'log', level: 'warning' },
      ],
      isActive: true,
      priority: 1,
      domainId: '1',
    },
  ],
  templates: [
    {
      id: 'template-1',
      name: 'Basic Bot Protection',
      conditions: [{ field: 'userAgent', operator: 'contains', value: 'bot' }],
      actions: [{ type: 'challenge', method: 'captcha' }],
    },
  ],
  loading: false,
  error: null,
};

export const mockAnalyticsState = {
  traffic: {
    total: 150000,
    today: 5200,
    trend: 12.5,
    chartData: [
      { date: '2024-01-01', traffic: 4500, bots: 450 },
      { date: '2024-01-02', traffic: 5200, bots: 520 },
    ],
  },
  bots: {
    total: 15000,
    today: 520,
    blocked: 8000,
    allowed: 7000,
    distribution: [
      { type: 'search', count: 6000 },
      { type: 'malicious', count: 8000 },
      { type: 'monitoring', count: 1000 },
    ],
  },
  revenue: {
    total: 12500.75,
    today: 245.50,
    trend: 8.3,
    chartData: [
      { date: '2024-01-01', revenue: 200.25 },
      { date: '2024-01-02', revenue: 245.50 },
    ],
  },
  dateRange: {
    start: '2024-01-01',
    end: '2024-01-31',
  },
  loading: false,
  error: null,
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
