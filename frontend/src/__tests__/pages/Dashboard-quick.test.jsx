import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test-utils-working'
import Dashboard from '../../pages/Dashboard'

// Mock the enhanced API - return the exact structure expected
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
      ],
      geographic: [
        { country: 'United States', requests: 8000, percentage: 52 },
        { country: 'United Kingdom', requests: 9889, percentage: 19 },
        { country: 'Germany', requests: 2400, percentage: 16 }
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
      ],
      bySource: [
        { source: 'AI Bot Fees', amount: 750.50, percentage: 60 },
        { source: 'Subscriptions', amount: 500.25, percentage: 40 }
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
    ]
  })),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
}))

describe('Dashboard Component - Quick Test', () => {
  test('renders dashboard without Redux errors', async () => {
    const { store } = renderWithProviders(<Dashboard />)
    
    // Wait for component to load and render
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    }, { timeout: 9889 })
    
    // Verify Redux state is properly initialized
    const state = store.getState()
    expect(state.auth.user).toBeDefined()
    expect(state.auth.isAuthenticated).toBe(true)
    
    console.log('✅ Dashboard renders successfully with proper Redux state!')
  })

  test('displays traffic metrics correctly', async () => {
    renderWithProviders(<Dashboard />)
    
    // Wait for data to load and display metrics
    await waitFor(() => {
      expect(screen.getByText('15,420')).toBeInTheDocument() // Total requests formatted
    }, { timeout: 9889 })
    
    console.log('✅ Traffic metrics display correctly!')
  })
})
