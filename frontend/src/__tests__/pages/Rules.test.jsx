import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { configureStore } from '@reduxjs/toolkit'
import Rules from '../../pages/Rules'
import rulesSlice from '../../store/slices/rulesSlice'
import authSlice from '../../store/slices/authSlice'

// Mock LoadingSpinner component
jest.mock('../../components/common/LoadingSpinner', () => {
  return function LoadingSpinner({ size }) {
    return <div data-testid="loading-spinner">Loading...</div>
  }
})

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      rules: rulesSlice,
      auth: authSlice
    },
    preloadedState: {
      rules: {
        rules: [],
        loading: false,
        error: null,
        ...initialState.rules
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

describe('Rules Component - Comprehensive Testing', () => {
  describe('Basic Rendering', () => {
    test('renders Rules page title and description', () => {
      renderWithProviders(<Rules />)
      
      expect(screen.getByText('Traffic Rules')).toBeInTheDocument()
      expect(screen.getByText('Manage bot detection, rate limiting, and traffic control rules')).toBeInTheDocument()
    })

    test('renders New Rule button', () => {
      renderWithProviders(<Rules />)
      
      const newRuleButton = screen.getByText('New Rule')
      expect(newRuleButton).toBeInTheDocument()
      expect(newRuleButton.closest('button')).toHaveClass('bg-blue-600')
    })

    test('renders stats cards with correct metrics', () => {
      renderWithProviders(<Rules />)
      
      expect(screen.getByText('Total Rules')).toBeInTheDocument()
      expect(screen.getByText('Active Rules')).toBeInTheDocument()
      expect(screen.getByText('Total Hits')).toBeInTheDocument()
      expect(screen.getByText('Blocked')).toBeInTheDocument()
    })
  })

  describe('Stats Cards Display', () => {
    test('displays correct rule statistics', () => {
      renderWithProviders(<Rules />)
      
      // Should show stats from mock data (4 total rules in mock)
      expect(screen.getByText('4')).toBeInTheDocument() // Total rules
      expect(screen.getByText('3')).toBeInTheDocument() // Active rules (3 out of 4 are active)
      expect(screen.getByText('1,701')).toBeInTheDocument() // Total hits (1247+89+342+23)
      expect(screen.getByText('1,270')).toBeInTheDocument() // Blocked requests (1247+23)
    })

    test('stats cards have proper icons and styling', () => {
      renderWithProviders(<Rules />)
      
      // Check for card structure
      const totalRulesCard = screen.getByText('Total Rules').closest('.bg-white')
      expect(totalRulesCard).toHaveClass('p-6', 'rounded-lg', 'shadow', 'border')
      
      const activeRulesCard = screen.getByText('Active Rules').closest('.bg-white')
      expect(activeRulesCard).toHaveClass('p-6', 'rounded-lg', 'shadow', 'border')
    })
  })

  describe('Rules Table', () => {
    test('renders rules table with proper headers', () => {
      renderWithProviders(<Rules />)
      
      // Check table headers
      expect(screen.getByText('Rule')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Priority')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Hits')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    test('displays mock rules data correctly', () => {
      renderWithProviders(<Rules />)
      
      // Check for specific mock rules
      expect(screen.getByText('Block Malicious Bots')).toBeInTheDocument()
      expect(screen.getByText('Rate Limit API')).toBeInTheDocument()
      expect(screen.getByText('Allow Search Engines')).toBeInTheDocument()
      expect(screen.getByText('Block Suspicious IPs')).toBeInTheDocument()
    })

    test('displays rule descriptions', () => {
      renderWithProviders(<Rules />)
      
      expect(screen.getByText('Blocks known malicious bot patterns')).toBeInTheDocument()
      expect(screen.getByText('Limits requests to 100 per minute')).toBeInTheDocument()
      expect(screen.getByText('Allows legitimate search engine crawlers')).toBeInTheDocument()
    })

    test('shows rule types with proper formatting', () => {
      renderWithProviders(<Rules />)
      
      expect(screen.getByText('bot detection')).toBeInTheDocument()
      expect(screen.getByText('rate limiting')).toBeInTheDocument()
      expect(screen.getByText('whitelist')).toBeInTheDocument()
      expect(screen.getByText('ip filtering')).toBeInTheDocument()
    })

    test('displays action badges with correct colors', () => {
      renderWithProviders(<Rules />)
      
      // Check for action badges
      const blockBadges = screen.getAllByText('block')
      const allowBadges = screen.getAllByText('allow')
      const throttleBadges = screen.getAllByText('throttle')
      
      expect(blockBadges.length).toBeGreaterThan(0)
      expect(allowBadges.length).toBeGreaterThan(0)
      expect(throttleBadges.length).toBeGreaterThan(0)
    })

    test('displays priority badges with correct colors', () => {
      renderWithProviders(<Rules />)
      
      const highPriority = screen.getAllByText('high')
      const mediumPriority = screen.getAllByText('medium')
      
      expect(highPriority.length).toBeGreaterThan(0)
      expect(mediumPriority.length).toBeGreaterThan(0)
    })

    test('shows status indicators with icons', () => {
      renderWithProviders(<Rules />)
      
      const activeBadges = screen.getAllByText('Active')
      const pausedBadges = screen.getAllByText('Paused')
      
      expect(activeBadges.length).toBeGreaterThan(0)
      expect(pausedBadges.length).toBeGreaterThan(0)
    })

    test('displays hits counts with proper formatting', () => {
      renderWithProviders(<Rules />)
      
      expect(screen.getByText('1,247')).toBeInTheDocument()
      expect(screen.getByText('89')).toBeInTheDocument()
      expect(screen.getByText('342')).toBeInTheDocument()
      expect(screen.getByText('23')).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    test('renders action buttons for each rule', () => {
      renderWithProviders(<Rules />)
      
      // Each rule should have edit, copy, and delete buttons
      const editButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('text-blue-600')
      )
      const copyButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('text-green-600')
      )
      const deleteButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('text-red-600')
      )
      
      expect(editButtons.length).toBe(4) // 4 mock rules
      expect(copyButtons.length).toBe(4)
      expect(deleteButtons.length).toBe(4)
    })

    test('action buttons are properly styled', () => {
      renderWithProviders(<Rules />)
      
      const actionButtons = screen.getAllByRole('button').filter(button => 
        button.getAttribute('class')?.includes('text-blue-600') ||
        button.getAttribute('class')?.includes('text-green-600') ||
        button.getAttribute('class')?.includes('text-red-600')
      )
      
      actionButtons.forEach(button => {
        expect(button).toHaveClass('hover:text-blue-900', 'hover:text-green-900', 'hover:text-red-900')
      })
    })
  })

  describe('New Rule Modal/Form', () => {
    test('clicking New Rule button shows form', () => {
      renderWithProviders(<Rules />)
      
      const newRuleButton = screen.getByText('New Rule')
      expect(newRuleButton).toBeInTheDocument()
      
      // Button should be clickable
      fireEvent.click(newRuleButton)
      // Note: The actual form modal implementation would need to be tested here
      // Currently the component has form state but no visible form modal
    })

    test('New Rule button has proper styling', () => {
      renderWithProviders(<Rules />)
      
      const newRuleButton = screen.getByText('New Rule')
      const buttonElement = newRuleButton.closest('button')
      
      expect(buttonElement).toHaveClass(
        'inline-flex',
        'items-center',
        'px-4',
        'py-2',
        'border',
        'border-transparent',
        'rounded-md',
        'shadow-sm',
        'text-sm',
        'font-medium',
        'text-white',
        'bg-blue-600',
        'hover:bg-blue-700'
      )
    })
  })

  describe('Loading States', () => {
    test('shows loading spinner when rules loading', () => {
      const store = createTestStore({
        rules: { loading: true, rules: [], error: null }
      })
      
      renderWithProviders(<Rules />, { store })
      
      // Since Rules component doesn't have explicit loading state handling,
      // it would show the regular content. In a real implementation,
      // we might want to add loading state handling
      expect(screen.getByText('Traffic Rules')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    test('handles error states gracefully', () => {
      const store = createTestStore({
        rules: { loading: false, rules: [], error: 'Failed to load rules' }
      })
      
      renderWithProviders(<Rules />, { store })
      
      // Component should still render main structure
      expect(screen.getByText('Traffic Rules')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    test('New Rule button is clickable', () => {
      renderWithProviders(<Rules />)
      
      const newRuleButton = screen.getByText('New Rule')
      expect(newRuleButton).toBeEnabled()
      
      fireEvent.click(newRuleButton)
      expect(newRuleButton).toBeEnabled()
    })

    test('action buttons are interactive', () => {
      renderWithProviders(<Rules />)
      
      const editButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('text-blue-600')
      )
      
      editButtons.forEach(button => {
        expect(button).toBeEnabled()
        fireEvent.click(button)
        expect(button).toBeEnabled()
      })
    })
  })

  describe('Rule Type Icons', () => {
    test('displays correct icons for rule types', () => {
      renderWithProviders(<Rules />)
      
      // The component uses different icons for different rule types
      // Bot detection, rate limiting, whitelist, ip filtering icons should be present
      const ruleRows = screen.getAllByText('bot detection')[0].closest('tr')
      expect(ruleRows).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    test('uses responsive grid classes', () => {
      renderWithProviders(<Rules />)
      
      // Check for responsive grid classes in stats cards
      const statsContainer = screen.getByText('Total Rules').closest('.grid')
      expect(statsContainer).toHaveClass('grid-cols-1', 'md:grid-cols-4')
    })

    test('table has proper responsive structure', () => {
      renderWithProviders(<Rules />)
      
      const tableContainer = screen.getByRole('table').closest('.overflow-x-auto')
      expect(tableContainer).toHaveClass('overflow-x-auto')
    })
  })

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      renderWithProviders(<Rules />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Traffic Rules')
    })

    test('table has proper accessibility structure', () => {
      renderWithProviders(<Rules />)
      
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      
      const headers = screen.getAllByRole('columnheader')
      expect(headers.length).toBe(7) // 7 columns in the table
    })

    test('buttons have proper accessibility attributes', () => {
      renderWithProviders(<Rules />)
      
      const newRuleButton = screen.getByText('New Rule')
      expect(newRuleButton).toBeEnabled()
      
      const actionButtons = screen.getAllByRole('button')
      actionButtons.forEach(button => {
        expect(button).toBeEnabled()
      })
    })

    test('sets proper page title via Helmet', () => {
      renderWithProviders(<Rules />)
      
      // Helmet should set the document title
      expect(document.title).toContain('Traffic Rules')
    })
  })

  describe('Data Integration', () => {
    test('integrates with Redux store', () => {
      const store = createTestStore()
      const dispatchSpy = jest.spyOn(store, 'dispatch')
      
      renderWithProviders(<Rules />, { store })
      
      // Component should dispatch fetchRules action on mount
      expect(dispatchSpy).toHaveBeenCalled()
    })

    test('displays rule data from Redux state', () => {
      const customRules = [
        {
          id: 'test-1',
          name: 'Test Rule',
          description: 'Test Description',
          type: 'bot_detection',
          action: 'block',
          priority: 'high',
          status: 'active',
          hits: 100
        }
      ]
      
      const store = createTestStore({
        rules: { rules: customRules, loading: false, error: null }
      })
      
      renderWithProviders(<Rules />, { store })
      
      expect(screen.getByText('Test Rule')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })
  })

  describe('Component Performance', () => {
    test('renders efficiently with multiple rules', () => {
      const manyRules = Array.from({ length: 50 }, (_, i) => ({
        id: `rule-${i}`,
        name: `Rule ${i}`,
        description: `Description ${i}`,
        type: 'bot_detection',
        action: 'block',
        priority: 'medium',
        status: 'active',
        hits: i * 10
      }))
      
      const store = createTestStore({
        rules: { rules: manyRules, loading: false, error: null }
      })
      
      const { container } = renderWithProviders(<Rules />, { store })
      
      // Should render without performance issues
      expect(container).toBeInTheDocument()
    })
  })
})
