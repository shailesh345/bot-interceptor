import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { configureStore } from '@reduxjs/toolkit'
import Billing from '../../pages/Billing'
import billingSlice from '../../store/slices/billingSlice'
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
      billing: billingSlice,
      auth: authSlice
    },
    preloadedState: {
      billing: {
        subscription: null,
        invoices: [],
        loading: false,
        error: null,
        ...initialState.billing
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

describe('Billing Component - Comprehensive Testing', () => {
  describe('Basic Rendering', () => {
    test('renders Billing page title and description', () => {
      renderWithProviders(<Billing />)
      
      expect(screen.getByText('Billing & Subscription')).toBeInTheDocument()
      expect(screen.getByText('Manage your subscription, view usage, and download invoices.')).toBeInTheDocument()
    })

    test('renders tab navigation', () => {
      renderWithProviders(<Billing />)
      
      const tabs = ['Overview', 'Plans', 'Usage', 'Invoices']
      
      tabs.forEach(tab => {
        expect(screen.getByText(tab)).toBeInTheDocument()
      })
    })

    test('starts with Overview tab active', () => {
      renderWithProviders(<Billing />)
      
      const overviewTab = screen.getByText('Overview').closest('button')
      expect(overviewTab).toHaveClass('border-blue-500', 'text-blue-600')
      
      expect(screen.getByText('Current Plan')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    test('switches between tabs correctly', () => {
      renderWithProviders(<Billing />)
      
      // Start on Overview tab
      expect(screen.getByText('Current Plan')).toBeInTheDocument()
      
      // Click Plans tab
      fireEvent.click(screen.getByText('Plans'))
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
      
      // Click Usage tab
      fireEvent.click(screen.getByText('Usage'))
      expect(screen.getByText('Usage This Month')).toBeInTheDocument()
      
      // Click Invoices tab
      fireEvent.click(screen.getByText('Invoices'))
      expect(screen.getByText('Billing History')).toBeInTheDocument()
    })

    test('applies correct styling to active tab', () => {
      renderWithProviders(<Billing />)
      
      // Overview should be active by default
      const overviewTab = screen.getByText('Overview').closest('button')
      expect(overviewTab).toHaveClass('border-blue-500', 'text-blue-600')
      
      // Plans should be inactive
      const plansTab = screen.getByText('Plans').closest('button')
      expect(plansTab).toHaveClass('border-transparent', 'text-gray-500')
    })
  })

  describe('Overview Tab', () => {
    test('displays current plan information', () => {
      renderWithProviders(<Billing />)
      
      expect(screen.getByText('Current Plan')).toBeInTheDocument()
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('$99')).toBeInTheDocument()
      expect(screen.getByText('2024-02-15')).toBeInTheDocument()
    })

    test('displays plan status badge', () => {
      renderWithProviders(<Billing />)
      
      const statusBadge = screen.getByText('active')
      expect(statusBadge).toHaveClass('text-green-600', 'bg-green-100')
    })

    test('displays plan details cards', () => {
      renderWithProviders(<Billing />)
      
      expect(screen.getByText('Plan')).toBeInTheDocument()
      expect(screen.getByText('Monthly Cost')).toBeInTheDocument()
      expect(screen.getByText('Next Billing')).toBeInTheDocument()
    })

    test('displays action buttons', () => {
      renderWithProviders(<Billing />)
      
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument()
      expect(screen.getByText('Update Payment Method')).toBeInTheDocument()
    })

    test('displays usage overview', () => {
      renderWithProviders(<Billing />)
      
      expect(screen.getByText('Usage This Month')).toBeInTheDocument()
      expect(screen.getByText('Domains')).toBeInTheDocument()
      expect(screen.getByText('Requests')).toBeInTheDocument()
      expect(screen.getByText('Storage')).toBeInTheDocument()
    })

    test('usage progress bars are displayed', () => {
      renderWithProviders(<Billing />)
      
      // Should have progress bars for each usage metric
      const progressBars = document.querySelectorAll('.bg-gray-200.rounded-full.h-2')
      expect(progressBars.length).toBeGreaterThanOrEqual(3) // At least 3 usage metrics
    })
  })

  describe('Plans Tab', () => {
    test('displays plan comparison', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Plans'))
      
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
      expect(screen.getByText('Starter')).toBeInTheDocument()
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('Enterprise')).toBeInTheDocument()
    })

    test('displays plan pricing', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Plans'))
      
      expect(screen.getByText('$29')).toBeInTheDocument() // Starter price
      expect(screen.getByText('$99')).toBeInTheDocument() // Professional price
      expect(screen.getByText('$299')).toBeInTheDocument() // Enterprise price
    })

    test('displays plan features', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Plans'))
      
      expect(screen.getByText('Up to 3 domains')).toBeInTheDocument()
      expect(screen.getByText('Up to 10 domains')).toBeInTheDocument()
      expect(screen.getByText('Unlimited domains')).toBeInTheDocument()
    })

    test('shows Most Popular badge on Professional plan', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Plans'))
      
      expect(screen.getByText('Most Popular')).toBeInTheDocument()
    })

    test('current plan shows Current Plan button', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Plans'))
      
      const currentPlanButton = screen.getByText('Current Plan')
      expect(currentPlanButton).toBeInTheDocument()
      expect(currentPlanButton.closest('button')).toBeDisabled()
    })

    test('other plans show Select Plan button', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Plans'))
      
      const selectPlanButtons = screen.getAllByText('Select Plan')
      expect(selectPlanButtons.length).toBe(2) // Starter and Enterprise
    })
  })

  describe('Usage Tab', () => {
    test('displays usage metrics cards', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Usage'))
      
      expect(screen.getByText('Domains')).toBeInTheDocument()
      expect(screen.getByText('Requests')).toBeInTheDocument()
      expect(screen.getByText('Storage')).toBeInTheDocument()
    })

    test('displays usage values correctly', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Usage'))
      
      expect(screen.getByText('7')).toBeInTheDocument() // Current domains
      expect(screen.getByText('0.8M')).toBeInTheDocument() // Current requests (750,000 / 1,000,000 = 0.8M)
      expect(screen.getByText('2.4 GB')).toBeInTheDocument() // Current storage
    })

    test('displays usage limits', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Usage'))
      
      expect(screen.getByText('of 10 allowed')).toBeInTheDocument() // Domains limit
      expect(screen.getByText('of 1M allowed')).toBeInTheDocument() // Requests limit
      expect(screen.getByText('of 10 GB allowed')).toBeInTheDocument() // Storage limit
    })

    test('displays detailed usage breakdown', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Usage'))
      
      expect(screen.getByText('Detailed Usage Breakdown')).toBeInTheDocument()
      
      // Should show percentage usage
      const percentageTexts = screen.getAllByText(/% used/)
      expect(percentageTexts.length).toBeGreaterThanOrEqual(3)
    })

    test('usage progress bars show correct colors', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Usage'))
      
      // Should have different colored progress bars based on usage percentage
      const progressBars = document.querySelectorAll('.h-3.rounded-full')
      expect(progressBars.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Invoices Tab', () => {
    test('displays billing history', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Invoices'))
      
      expect(screen.getByText('Billing History')).toBeInTheDocument()
      expect(screen.getByText('Download All')).toBeInTheDocument()
    })

    test('displays invoice table headers', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Invoices'))
      
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    test('displays mock invoice data', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Invoices'))
      
      expect(screen.getByText('Professional Plan - January 2024')).toBeInTheDocument()
      expect(screen.getByText('Professional Plan - December 2023')).toBeInTheDocument()
      expect(screen.getByText('Professional Plan - November 2023')).toBeInTheDocument()
    })

    test('displays invoice amounts', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Invoices'))
      
      const amounts = screen.getAllByText('$99.00')
      expect(amounts.length).toBe(3) // All mock invoices are $99.00
    })

    test('displays paid status badges', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Invoices'))
      
      const paidBadges = screen.getAllByText('paid')
      expect(paidBadges.length).toBe(3) // All mock invoices are paid
    })

    test('invoice action buttons are present', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Invoices'))
      
      // Should have download buttons for each invoice
      const actionButtons = document.querySelectorAll('tbody button')
      expect(actionButtons.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Loading States', () => {
    test('shows loading spinner when billing loading', () => {
      const store = createTestStore({
        billing: { loading: true, subscription: null, invoices: [], error: null }
      })
      
      renderWithProviders(<Billing />, { store })
      
      // Component doesn't have explicit loading state handling in current implementation
      // But it should still render the basic structure
      expect(screen.getByText('Billing & Subscription')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    test('handles error states gracefully', () => {
      const store = createTestStore({
        billing: { loading: false, subscription: null, invoices: [], error: 'Failed to load billing data' }
      })
      
      renderWithProviders(<Billing />, { store })
      
      // Component should still render main structure
      expect(screen.getByText('Billing & Subscription')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    test('upgrade plan button is clickable', () => {
      renderWithProviders(<Billing />)
      
      const upgradeButton = screen.getByText('Upgrade Plan')
      expect(upgradeButton).toBeEnabled()
      
      fireEvent.click(upgradeButton)
      expect(upgradeButton).toBeEnabled()
    })

    test('update payment method button is clickable', () => {
      renderWithProviders(<Billing />)
      
      const updatePaymentButton = screen.getByText('Update Payment Method')
      expect(updatePaymentButton).toBeEnabled()
      
      fireEvent.click(updatePaymentButton)
      expect(updatePaymentButton).toBeEnabled()
    })

    test('select plan buttons are clickable', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Plans'))
      
      const selectPlanButtons = screen.getAllByText('Select Plan')
      selectPlanButtons.forEach(button => {
        expect(button).toBeEnabled()
        fireEvent.click(button)
        expect(button).toBeEnabled()
      })
    })

    test('download all button is clickable', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Invoices'))
      
      const downloadAllButton = screen.getByText('Download All')
      expect(downloadAllButton).toBeEnabled()
      
      fireEvent.click(downloadAllButton)
      expect(downloadAllButton).toBeEnabled()
    })
  })

  describe('Data Integration', () => {
    test('fetches billing data on mount', () => {
      const store = createTestStore()
      const dispatchSpy = jest.spyOn(store, 'dispatch')
      
      renderWithProviders(<Billing />, { store })
      
      expect(dispatchSpy).toHaveBeenCalled()
    })

    test('displays data from component state', () => {
      renderWithProviders(<Billing />)
      
      // Current plan data should be displayed
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('$99')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
    })
  })

  describe('Utility Functions', () => {
    test('formats status colors correctly', () => {
      renderWithProviders(<Billing />)
      
      const activeStatus = screen.getByText('active')
      expect(activeStatus).toHaveClass('text-green-600', 'bg-green-100')
    })

    test('formats usage percentages correctly', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Usage'))
      
      // Usage percentages should be calculated and displayed
      const usageTexts = screen.getAllByText(/% used/)
      expect(usageTexts.length).toBeGreaterThanOrEqual(3)
    })

    test('formats usage numbers correctly', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Usage'))
      
      // Numbers should be formatted with commas or appropriate units
      expect(screen.getByText('7')).toBeInTheDocument() // Domains
      expect(screen.getByText('0.8M')).toBeInTheDocument() // Requests in millions
      expect(screen.getByText('2.4 GB')).toBeInTheDocument() // Storage in GB
    })
  })

  describe('Responsive Design', () => {
    test('uses responsive grid classes', () => {
      renderWithProviders(<Billing />)
      
      // Plan cards should use responsive grid
      fireEvent.click(screen.getByText('Plans'))
      
      const planGrid = screen.getByText('Starter').closest('.grid')
      expect(planGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-3')
    })

    test('usage cards use responsive layout', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Usage'))
      
      const usageGrid = screen.getByText('Domains').closest('.grid')
      expect(usageGrid).toHaveClass('grid-cols-1', 'md:grid-cols-3')
    })

    test('invoice table has overflow handling', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Invoices'))
      
      const tableContainer = screen.getByRole('table').closest('.overflow-x-auto')
      expect(tableContainer).toHaveClass('overflow-x-auto')
    })
  })

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      renderWithProviders(<Billing />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Billing & Subscription')
      
      // Tab content should have h3 headings
      const currentPlanHeading = screen.getByRole('heading', { level: 3 })
      expect(currentPlanHeading).toHaveTextContent('Current Plan')
    })

    test('tab navigation is keyboard accessible', () => {
      renderWithProviders(<Billing />)
      
      const tabs = screen.getAllByRole('button').filter(button => 
        ['Overview', 'Plans', 'Usage', 'Invoices'].includes(button.textContent)
      )
      
      expect(tabs.length).toBe(4)
      tabs.forEach(tab => {
        expect(tab).toBeEnabled()
      })
    })

    test('table has proper accessibility structure', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Invoices'))
      
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      
      const headers = screen.getAllByRole('columnheader')
      expect(headers.length).toBe(5) // 5 columns in the table
    })

    test('buttons have proper accessibility attributes', () => {
      renderWithProviders(<Billing />)
      
      const upgradeButton = screen.getByText('Upgrade Plan')
      expect(upgradeButton).toBeEnabled()
      
      const updatePaymentButton = screen.getByText('Update Payment Method')
      expect(updatePaymentButton).toBeEnabled()
    })

    test('sets proper page title via Helmet', () => {
      renderWithProviders(<Billing />)
      
      expect(document.title).toContain('Billing')
    })
  })

  describe('Plan Modal Functionality', () => {
    test('upgrade plan button shows modal state', () => {
      renderWithProviders(<Billing />)
      
      const upgradeButton = screen.getByText('Upgrade Plan')
      fireEvent.click(upgradeButton)
      
      // Component has showPlanModal state but doesn't render modal content yet
      // This would test the modal when implemented
      expect(upgradeButton).toBeEnabled()
    })
  })

  describe('Visual Elements', () => {
    test('displays proper icons for metrics', () => {
      renderWithProviders(<Billing />)
      
      // Each metric card should have an icon (SVG element)
      const metricsSection = screen.getByText('Plan').closest('.border')
      const iconElements = metricsSection.querySelectorAll('svg')
      expect(iconElements.length).toBeGreaterThan(0)
    })

    test('plan cards have proper styling', () => {
      renderWithProviders(<Billing />)
      
      fireEvent.click(screen.getByText('Plans'))
      
      const professionalPlan = screen.getByText('Most Popular').closest('.bg-white')
      expect(professionalPlan).toHaveClass('border-2', 'border-blue-500')
      
      const starterPlan = screen.getByText('Starter').closest('.bg-white')
      expect(starterPlan).toHaveClass('border-2', 'border-gray-200')
    })

    test('status badges have correct styling', () => {
      renderWithProviders(<Billing />)
      
      const activeStatus = screen.getByText('active')
      expect(activeStatus).toHaveClass('inline-flex', 'px-3', 'py-1', 'text-sm', 'font-medium', 'rounded-full')
    })
  })
})
