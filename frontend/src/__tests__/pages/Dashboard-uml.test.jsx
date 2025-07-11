import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test-utils-working'
import Dashboard from '../../pages/Dashboard'

// Mock the enhanced API with working structure
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
        { date: '2024-01-02', requests: 3000, blocked: 300 },
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
  })),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
}))

describe('Dashboard Component - UML Architecture Validation', () => {
  test('renders dashboard with UML DashMetrics pattern', async () => {
    const { store } = renderWithProviders(<Dashboard />)
    
    // Wait for data to load (simulates the 500ms delay)
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // UML DashMetrics: Verify traffic metrics display
    expect(screen.getByText('15,420')).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    
    // Verify Redux authentication state
    const state = store.getState()
    expect(state.auth.user).toBeDefined()
    expect(state.auth.isAuthenticated).toBe(true)
  })

  test('demonstrates UML DashCharts pattern with traffic analytics', async () => {
    renderWithProviders(<Dashboard />)
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // UML DashCharts: Verify charts are rendering (Recharts components)
    // Charts will have warnings in test environment but should render
    const chartContainers = document.querySelectorAll('.recharts-wrapper')
    expect(chartContainers.length).toBeGreaterThan(0)
  })

  test('validates UML DashRefresh functionality', async () => {
    renderWithProviders(<Dashboard />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // UML DashRefresh: Find and click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    expect(refreshButton).toBeInTheDocument()
    
    // Test refresh functionality
    fireEvent.click(refreshButton)
    
    // Verify refresh button is disabled during refresh
    expect(refreshButton).toBeDisabled()
  })

  test('shows UML loading state pattern initially', () => {
    renderWithProviders(<Dashboard />)
    
    // UML: Loading indicator should be visible initially
    const loadingSpinner = document.querySelector('.animate-spin')
    expect(loadingSpinner).toBeInTheDocument()
  })

  test('verifies UML time range filtering controls', async () => {
    renderWithProviders(<Dashboard />)
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // UML ChartFilters: Verify time range selector
    const timeSelector = screen.getByDisplayValue('Last 24 Hours')
    expect(timeSelector).toBeInTheDocument()
    
    // Test time range options
    expect(screen.getByText('Last Hour')).toBeInTheDocument()
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument()
  })

  test('validates responsive layout and accessibility', async () => {
    renderWithProviders(<Dashboard />)
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // UML: Verify responsive grid layout
    const gridContainer = document.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    
    // UML: Verify accessibility elements
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
    
    // Verify buttons are accessible
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
