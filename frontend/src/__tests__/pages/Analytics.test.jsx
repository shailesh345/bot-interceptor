import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { configureStore } from '@reduxjs/toolkit'
import Analytics from '../../pages/Analytics'
import analyticsSlice from '../../store/slices/analyticsSlice'
import authSlice from '../../store/slices/authSlice'

// Mock the chart components to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
  ScatterChart: ({ children }) => <div data-testid="scatter-chart">{children}</div>
}))

// Mock LoadingSpinner component
jest.mock('../../components/common/LoadingSpinner', () => {
  return function LoadingSpinner({ size }) {
    return <div data-testid="loading-spinner">Loading...</div>
  }
})

// Mock the enhanced mock API with comprehensive data
jest.mock('../../services/enhancedMockAPI', () => ({
  generateAdvancedAnalyticsData: jest.fn(() => ({
    traffic: {
      overview: {
        totalRequests: 15678234,
        botRequests: 2341234,
        blockedRequests: 1234567,
        revenue: 45678
      },
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        value: Math.floor(Math.random() * 100000) + 50000
      })),
      hourly: Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        requests: Math.floor(Math.random() * 5000) + 1000,
        bots: Math.floor(Math.random() * 1000) + 100,
        blocked: Math.floor(Math.random() * 500) + 50
      })),
      geographic: [
        { country: 'United States', requests: 5000000, percentage: 32 },
        { country: 'United Kingdom', requests: 2000000, percentage: 13 },
        { country: 'Germany', requests: 1500000, percentage: 10 }
      ]
    },
    bots: {
      categories: [
        { name: 'Search Engines', percentage: 45, requests: 1053353 },
        { name: 'Social Media', percentage: 25, requests: 585309 },
        { name: 'Malicious', percentage: 20, requests: 468247 }
      ],
      topBots: [
        { name: 'Googlebot', requests: 500000, blocked: 0, revenue: 0 },
        { name: 'Malicious Scraper', requests: 250000, blocked: 250000, revenue: 0 },
        { name: 'Facebook Bot', requests: 150000, blocked: 0, revenue: 0 }
      ]
    },
    revenue: {
      bySource: [
        { source: 'Direct Traffic', amount: 25000, percentage: 55 },
        { source: 'Organic Search', amount: 15000, percentage: 33 },
        { source: 'Social Media', amount: 5678, percentage: 12 }
      ]
    }
  }))
}))

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      analytics: analyticsSlice,
      auth: authSlice
    },
    preloadedState: {
      analytics: {
        metrics: {},
        loading: false,
        error: null,
        ...initialState.analytics
      },
      auth: {
        user: { name: 'Test User', email: 'test@example.com' },
        isAuthenticated: true,
        loading: false,
        ...initialState.auth
      }
    }
  })
}

const renderWithProviders = (ui, { store = createTestStore(), ...options } = {}) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        <HelmetProvider>
          {children}
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}

describe('Analytics Component - Comprehensive Testing', () => {
  describe('Basic Rendering', () => {
    test('renders Analytics page title and description', () => {
      renderWithProviders(<Analytics />)
      
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive traffic insights and bot intelligence')).toBeInTheDocument()
    })

    test('renders time range selector', () => {
      renderWithProviders(<Analytics />)
      
      const timeRangeSelect = screen.getByDisplayValue('Last 30 Days')
      expect(timeRangeSelect).toBeInTheDocument()
      
      // Check all options are present
      expect(screen.getByText('Last 24 Hours')).toBeInTheDocument()
      expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
      expect(screen.getByText('Last 90 Days')).toBeInTheDocument()
    })

    test('renders action buttons', () => {
      renderWithProviders(<Analytics />)
      
      expect(screen.getByText('Export')).toBeInTheDocument()
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    test('renders all tab options', () => {
      renderWithProviders(<Analytics />)
      
      const tabs = [
        'Overview',
        'Traffic Analysis', 
        'Bot Intelligence',
        'Revenue Analytics',
        'Geographic Data',
        'Real-time'
      ]
      
      tabs.forEach(tab => {
        expect(screen.getByText(tab)).toBeInTheDocument()
      })
    })

    test('switches tabs correctly', () => {
      renderWithProviders(<Analytics />)
      
      // Should start on Overview tab
      expect(screen.getByText('Total Requests')).toBeInTheDocument()
      
      // Click Traffic Analysis tab
      fireEvent.click(screen.getByText('Traffic Analysis'))
      expect(screen.getByText('Hourly Traffic Pattern')).toBeInTheDocument()
      
      // Click Bot Intelligence tab
      fireEvent.click(screen.getByText('Bot Intelligence'))
      expect(screen.getByText('Top Bot Sources')).toBeInTheDocument()
      
      // Click Real-time tab
      fireEvent.click(screen.getByText('Real-time'))
      expect(screen.getByText('Active Requests')).toBeInTheDocument()
    })

    test('applies correct styling to active tab', () => {
      renderWithProviders(<Analytics />)
      
      // Overview should be active by default
      const overviewTab = screen.getByText('Overview').closest('button')
      expect(overviewTab).toHaveClass('border-blue-500', 'text-blue-600')
      
      // Traffic Analysis should be inactive
      const trafficTab = screen.getByText('Traffic Analysis').closest('button')
      expect(trafficTab).toHaveClass('border-transparent', 'text-gray-500')
    })
  })

  describe('Overview Tab Content', () => {
    test('displays key metrics cards', async () => {
      renderWithProviders(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Total Requests')).toBeInTheDocument()
        expect(screen.getByText('Bot Requests')).toBeInTheDocument()
        expect(screen.getByText('Blocked Requests')).toBeInTheDocument()
        expect(screen.getByText('Revenue')).toBeInTheDocument()
      })
    })

    test('displays formatted numbers in metrics', async () => {
      renderWithProviders(<Analytics />)
      
      await waitFor(() => {
        // Should show formatted numbers with commas (checking actual values from mock)
        expect(screen.getByText('15,678,234')).toBeInTheDocument()
        expect(screen.getByText('2,341,234')).toBeInTheDocument()
        expect(screen.getByText('1,234,567')).toBeInTheDocument()
        // Revenue shows as $45,678
        expect(screen.getByText('$45,678')).toBeInTheDocument()
      })
    })

    test('displays percentage calculations', async () => {
      renderWithProviders(<Analytics />)
      
      await waitFor(() => {
        // Bot percentage calculation (2,341,234 / 15,678,234 * 100 = 14.9%)
        expect(screen.getByText('14.9% of total')).toBeInTheDocument()
        // Blocked percentage calculation (1,234,567 / 15,678,234 * 100 = 7.9%)
        expect(screen.getByText('7.9% blocked')).toBeInTheDocument()
      })
    })

    test('renders traffic trends chart', async () => {
      renderWithProviders(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Traffic Trends')).toBeInTheDocument()
        expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
      })
    })

    test('renders bot categories pie chart', async () => {
      renderWithProviders(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Bot Categories')).toBeInTheDocument()
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      })
    })

    test('displays revenue sources breakdown', async () => {
      renderWithProviders(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Revenue Sources')).toBeInTheDocument()
        expect(screen.getByText('Direct Traffic')).toBeInTheDocument()
        expect(screen.getByText('Organic Search')).toBeInTheDocument()
        expect(screen.getByText('Social Media')).toBeInTheDocument()
      })
    })
  })

  describe('Traffic Analysis Tab', () => {
    test('displays hourly traffic pattern chart', async () => {
      renderWithProviders(<Analytics />)
      
      fireEvent.click(screen.getByText('Traffic Analysis'))
      
      await waitFor(() => {
        expect(screen.getByText('Hourly Traffic Pattern')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })
    })

    test('displays geographic distribution', async () => {
      renderWithProviders(<Analytics />)
      
      fireEvent.click(screen.getByText('Traffic Analysis'))
      
      await waitFor(() => {
        expect(screen.getByText('Geographic Distribution')).toBeInTheDocument()
        expect(screen.getByText('United States')).toBeInTheDocument()
        expect(screen.getByText('United Kingdom')).toBeInTheDocument()
        expect(screen.getByText('Germany')).toBeInTheDocument()
      })
    })
  })

  describe('Bot Intelligence Tab', () => {
    test('displays top bot sources table', async () => {
      renderWithProviders(<Analytics />)
      
      fireEvent.click(screen.getByText('Bot Intelligence'))
      
      await waitFor(() => {
        expect(screen.getByText('Top Bot Sources')).toBeInTheDocument()
        expect(screen.getByText('Bot Name')).toBeInTheDocument()
        expect(screen.getByText('Requests')).toBeInTheDocument()
        expect(screen.getByText('Revenue')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        // Use getAllByText for elements that appear multiple times
        const blockedElements = screen.getAllByText('Blocked')
        expect(blockedElements.length).toBeGreaterThan(0)
      })
    })

    test('displays bot data in table', async () => {
      renderWithProviders(<Analytics />)
      
      fireEvent.click(screen.getByText('Bot Intelligence'))
      
      await waitFor(() => {
        expect(screen.getByText('Googlebot')).toBeInTheDocument()
        expect(screen.getByText('Malicious Scraper')).toBeInTheDocument()
        expect(screen.getByText('Facebook Bot')).toBeInTheDocument()
      })
    })

    test('displays bot category analysis chart', async () => {
      renderWithProviders(<Analytics />)
      
      fireEvent.click(screen.getByText('Bot Intelligence'))
      
      await waitFor(() => {
        expect(screen.getByText('Bot Category Analysis')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })
    })

    test('shows correct status badges', async () => {
      renderWithProviders(<Analytics />)
      
      fireEvent.click(screen.getByText('Bot Intelligence'))
      
      await waitFor(() => {
        const allowedBadges = screen.getAllByText('Allowed')
        const blockedBadges = screen.getAllByText('Blocked')
        expect(allowedBadges.length).toBeGreaterThan(0)
        expect(blockedBadges.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Real-time Tab', () => {
    test('displays real-time metrics cards', () => {
      renderWithProviders(<Analytics />)
      
      fireEvent.click(screen.getByText('Real-time'))
      
      expect(screen.getByText('Active Requests')).toBeInTheDocument()
      expect(screen.getByText('Requests/sec')).toBeInTheDocument()
      expect(screen.getByText('Active Bots')).toBeInTheDocument()
      expect(screen.getByText('Blocked/min')).toBeInTheDocument()
    })

    test('displays real-time values', () => {
      renderWithProviders(<Analytics />)
      
      fireEvent.click(screen.getByText('Real-time'))
      
      expect(screen.getByText('1,247')).toBeInTheDocument()
      expect(screen.getByText('89')).toBeInTheDocument()
      expect(screen.getByText('23')).toBeInTheDocument()
      expect(screen.getByText('156')).toBeInTheDocument()
    })

    test('displays live traffic feed', () => {
      renderWithProviders(<Analytics />)
      
      fireEvent.click(screen.getByText('Real-time'))
      
      expect(screen.getByText('Live Traffic Feed')).toBeInTheDocument()
      
      // Should show multiple traffic events
      const blockedEvents = screen.getAllByText('Blocked')
      const allowedEvents = screen.getAllByText('Allowed')
      const botEvents = screen.getAllByText('Bot Detected')
      
      expect(blockedEvents.length + allowedEvents.length + botEvents.length).toBeGreaterThan(0)
    })
  })

  describe('Loading States', () => {
    test('shows loading spinner when analytics loading and no data', () => {
      // Mock generateAdvancedAnalyticsData to return null initially
      require('../../services/enhancedMockAPI').generateAdvancedAnalyticsData.mockReturnValueOnce(null)
      
      const store = createTestStore({
        analytics: { loading: true, metrics: null, error: null }
      })
      
      renderWithProviders(<Analytics />, { store })
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    test('shows content when not loading even with data', () => {
      const store = createTestStore({
        analytics: { loading: false, metrics: null, error: null }
      })
      
      renderWithProviders(<Analytics />, { store })
      
      // Since generateAdvancedAnalyticsData provides data, tabs should be visible
      expect(screen.getByText('Overview')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    test('displays error message when analytics fails to load', () => {
      // Mock generateAdvancedAnalyticsData to return null when there's an error
      require('../../services/enhancedMockAPI').generateAdvancedAnalyticsData.mockReturnValueOnce(null)
      
      const store = createTestStore({
        analytics: { loading: false, metrics: null, error: 'Failed to load analytics data' }
      })
      
      renderWithProviders(<Analytics />, { store })
      
      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument()
    })

    test('applies error styling', () => {
      // Mock generateAdvancedAnalyticsData to return null when there's an error
      require('../../services/enhancedMockAPI').generateAdvancedAnalyticsData.mockReturnValueOnce(null)
      
      const store = createTestStore({
        analytics: { loading: false, metrics: null, error: 'Network error' }
      })
      
      renderWithProviders(<Analytics />, { store })
      
      const errorDiv = screen.getByText('Network error').closest('div')
      expect(errorDiv).toHaveClass('p-4', 'bg-red-50', 'text-red-600')
    })
  })

  describe('User Interactions', () => {
    test('changes time range when selected', () => {
      renderWithProviders(<Analytics />)
      
      const timeRangeSelect = screen.getByDisplayValue('Last 30 Days')
      fireEvent.change(timeRangeSelect, { target: { value: '7d' } })
      
      expect(screen.getByDisplayValue('Last 7 Days')).toBeInTheDocument()
    })

    test('time range options work correctly', () => {
      renderWithProviders(<Analytics />)
      
      const timeRangeSelect = screen.getByDisplayValue('Last 30 Days')
      
      // Test each option
      fireEvent.change(timeRangeSelect, { target: { value: '24h' } })
      expect(screen.getByDisplayValue('Last 24 Hours')).toBeInTheDocument()
      
      fireEvent.change(timeRangeSelect, { target: { value: '90d' } })
      expect(screen.getByDisplayValue('Last 90 Days')).toBeInTheDocument()
    })

    test('export button is clickable', () => {
      renderWithProviders(<Analytics />)
      
      const exportButton = screen.getByText('Export')
      expect(exportButton).toBeEnabled()
      
      fireEvent.click(exportButton)
      // Button should remain enabled after click
      expect(exportButton).toBeEnabled()
    })

    test('refresh button is clickable', () => {
      renderWithProviders(<Analytics />)
      
      const refreshButton = screen.getByText('Refresh')
      expect(refreshButton).toBeEnabled()
      
      fireEvent.click(refreshButton)
      expect(refreshButton).toBeEnabled()
    })
  })

  describe('Data Integration', () => {
    test('fetches analytics data on mount', () => {
      const store = createTestStore()
      const dispatchSpy = jest.spyOn(store, 'dispatch')
      
      renderWithProviders(<Analytics />, { store })
      
      expect(dispatchSpy).toHaveBeenCalled()
    })

    test('generates advanced analytics data', async () => {
      renderWithProviders(<Analytics />)
      
      await waitFor(() => {
        // Should display data from generateAdvancedAnalyticsData
        expect(screen.getByText('15,678,234')).toBeInTheDocument()
      })
    })

    test('handles analytics data correctly', async () => {
      renderWithProviders(<Analytics />)
      
      await waitFor(() => {
        // Verify data is displayed correctly
        expect(screen.getByText('Total Requests')).toBeInTheDocument()
        expect(screen.getByText('15,678,234')).toBeInTheDocument()
        expect(screen.getByText('+12.5% vs last period')).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design Elements', () => {
    test('uses responsive grid classes', () => {
      renderWithProviders(<Analytics />)
      
      // Check for responsive grid classes in metrics cards
      const metricsContainer = screen.getByText('Total Requests').closest('.grid')
      expect(metricsContainer).toHaveClass('grid-cols-1', 'md:grid-cols-4')
    })

    test('charts use responsive containers', async () => {
      renderWithProviders(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getAllByTestId('responsive-container')).toHaveLength(2)
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      renderWithProviders(<Analytics />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Analytics')
      
      const subHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(subHeadings.length).toBeGreaterThan(0)
    })

    test('tab navigation is keyboard accessible', () => {
      renderWithProviders(<Analytics />)
      
      const tabs = screen.getAllByRole('button')
      const tabButtons = tabs.filter(button => 
        ['Overview', 'Traffic Analysis', 'Bot Intelligence', 'Revenue Analytics', 'Geographic Data', 'Real-time']
          .includes(button.textContent)
      )
      
      expect(tabButtons.length).toBe(6)
      tabButtons.forEach(tab => {
        expect(tab).toBeEnabled()
      })
    })

    test('buttons have proper accessibility attributes', () => {
      renderWithProviders(<Analytics />)
      
      const exportButton = screen.getByText('Export')
      const refreshButton = screen.getByText('Refresh')
      
      expect(exportButton).toBeEnabled()
      expect(refreshButton).toBeEnabled()
    })

    test('sets proper page title via Helmet', () => {
      renderWithProviders(<Analytics />)
      
      // Helmet should set the document title
      expect(document.title).toContain('Analytics')
    })
  })
})
