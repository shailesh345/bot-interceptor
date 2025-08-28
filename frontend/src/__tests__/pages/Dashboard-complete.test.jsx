import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test-utils-working'
import Dashboard from '../../pages/Dashboard'

// Mock the enhanced API
jest.mock('../../services/enhancedMockAPI', () => ({
  generateAdvancedAnalyticsData: jest.fn(() => ({
    traffic: {
      overview: {
        totalRequests: 15420,
        humanRequests: 12080,
        botRequests: 2340,
        blockedRequests: 150,
        revenue: 1250.75
      },
      hourly: [
        { hour: '00', requests: 1200, blocked: 150 },
        { hour: '01', requests: 1100, blocked: 120 },
        { hour: '02', requests: 900, blocked: 90 }
      ],
      daily: [
        { date: '2024-01-01', requests: 4000, blocked: 400 },
        { date: '2024-01-02', requests: 9889, blocked: 300 },
        { date: '2024-01-03', requests: 2000, blocked: 200 }
      ]
    },
    bots: {
      categories: [
        { name: 'Search Engines', requests: 1800, percentage: 65, revenue: 0 },
        { name: 'AI Trainers', requests: 540, percentage: 25, revenue: 1000.50 },
        { name: 'Unknown', requests: 240, percentage: 10, revenue: 250.25 }
      ],
      topBots: [
        { name: 'GoogleBot', requests: 800, blocked: 0, revenue: 0 },
        { name: 'AI Crawler', requests: 400, blocked: 300, revenue: 500.25 }
      ]
    },
    revenue: {
      monthly: [
        { month: 'Jan', revenue: 1000, growth: 12.5 },
        { month: 'Feb', revenue: 1200, growth: 20.0 },
        { month: 'Mar', revenue: 1250, growth: 4.2 }
      ]
    },
    alerts: [
      {
        id: 1,
        message: 'High traffic detected',
        severity: 'warning',
        timestamp: new Date().toISOString()
      }
    ]
  }))
}));

describe('Dashboard Component - UML Compliance', () => {
  const mockAuthenticatedState = {
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
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // UML: Dashboard renders main components
  test('renders dashboard with main overview section', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-overview')).toBeInTheDocument();
    });
    
    // UML: DashMetrics - Key Metrics Cards
    expect(screen.getByText(/total traffic/i)).toBeInTheDocument();
    expect(screen.getByText(/127,543/)).toBeInTheDocument();
    expect(screen.getByText(/bot traffic/i)).toBeInTheDocument();
    expect(screen.getByText(/revenue/i)).toBeInTheDocument();
  });

  // UML: DashCharts - Traffic & Bot Charts
  test('displays traffic analytics charts', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('traffic-chart')).toBeInTheDocument();
    });
    
    // UML: Chart visualization elements
    expect(screen.getByText(/traffic overview/i)).toBeInTheDocument();
    expect(screen.getByText(/bot analytics/i)).toBeInTheDocument();
  });

  // UML: DashAlerts - Real-time Alerts
  test('shows real-time alerts and notifications', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('alerts-panel')).toBeInTheDocument();
    });
    
    // UML: Alert notifications
    expect(screen.getByText(/recent alerts/i)).toBeInTheDocument();
  });

  // UML: DashQuick - Quick Actions
  test('provides quick action buttons', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });
    
    // UML: Quick navigation actions
    expect(screen.getByText(/add domain/i)).toBeInTheDocument();
    expect(screen.getByText(/create rule/i)).toBeInTheDocument();
    expect(screen.getByText(/view analytics/i)).toBeInTheDocument();
  });

  // UML: DashRefresh - Auto-refresh Data
  test('handles data refresh functionality', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);
    
    // UML: Refresh indicator
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  // UML: ChartFilters - Date/Time Filters
  test('allows time range filtering', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('time-range-selector')).toBeInTheDocument();
    });
    
    const timeRangeSelect = screen.getByTestId('time-range-selector');
    
    // UML: Filter options
    expect(screen.getByText(/24h/)).toBeInTheDocument();
    expect(screen.getByText(/7d/)).toBeInTheDocument();
    expect(screen.getByText(/30d/)).toBeInTheDocument();
    
    fireEvent.change(timeRangeSelect, { target: { value: '7d' } });
    expect(timeRangeSelect.value).toBe('7d');
  });

  // UML: AlertConfig - Alert Configuration
  test('displays configurable alert settings', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('alert-config')).toBeInTheDocument();
    });
    
    // UML: Alert configuration options
    expect(screen.getByText(/alert settings/i)).toBeInTheDocument();
  });

  // UML: Performance metrics display
  test('shows performance metrics correctly', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
    });
    
    // UML: System performance indicators
    expect(screen.getByText(/uptime/i)).toBeInTheDocument();
    expect(screen.getByText(/99.97%/)).toBeInTheDocument();
    expect(screen.getByText(/response time/i)).toBeInTheDocument();
  });

  // UML: Bot distribution analytics
  test('displays bot distribution pie chart', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('bot-distribution-chart')).toBeInTheDocument();
    });
    
    // UML: Bot classification data
    expect(screen.getByText(/search engines/i)).toBeInTheDocument();
    expect(screen.getByText(/malicious/i)).toBeInTheDocument();
    expect(screen.getByText(/monitoring/i)).toBeInTheDocument();
  });

  // UML: Revenue analytics
  test('shows revenue tracking and trends', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('revenue-analytics')).toBeInTheDocument();
    });
    
    // UML: Revenue metrics
    expect(screen.getByText(/\$12,847/)).toBeInTheDocument();
    expect(screen.getByText(/revenue trend/i)).toBeInTheDocument();
  });

  // UML: Accessibility compliance
  test('meets accessibility requirements', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
    
    // UML: Proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // UML: Interactive elements have proper labels
    const refreshButton = screen.getByTestId('refresh-button');
    expect(refreshButton).toHaveAttribute('aria-label');
  });

  // UML: Loading states
  test('handles loading states appropriately', () => {
    const loadingState = {
      ...mockAuthenticatedState,
      dashboard: { loading: true }
    };
    
    renderWithProviders(<Dashboard />, { preloadedState: loadingState });
    
    // UML: Loading indicator during data fetch
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });

  // UML: Error handling
  test('handles error states gracefully', async () => {
    const errorState = {
      ...mockAuthenticatedState,
      dashboard: { 
        loading: false,
        error: 'Failed to load dashboard data'
      }
    };
    
    renderWithProviders(<Dashboard />, { preloadedState: errorState });
    
    // UML: Error display
    expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  // UML: Interactive chart elements
  test('charts are interactive and responsive', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('traffic-chart')).toBeInTheDocument();
    });
    
    // UML: Chart interactivity
    const chartElement = screen.getByTestId('traffic-chart');
    expect(chartElement).toHaveClass('recharts-wrapper');
  });

  // UML: Real-time data updates
  test('supports real-time data updates', async () => {
    renderWithProviders(<Dashboard />, { preloadedState: mockAuthenticatedState });
    
    await waitFor(() => {
      expect(screen.getByTestId('realtime-indicator')).toBeInTheDocument();
    });
    
    // UML: Real-time status indicator
    expect(screen.getByText(/live/i)).toBeInTheDocument();
  });
});
