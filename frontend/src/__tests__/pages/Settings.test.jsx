import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { configureStore } from '@reduxjs/toolkit'
import Settings from '../../pages/Settings'
import authSlice from '../../store/slices/authSlice'

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice
    },
    preloadedState: {
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

describe('Settings Component - Comprehensive Testing', () => {
  describe('Basic Rendering', () => {
    test('renders Settings page title and description', () => {
      renderWithProviders(<Settings />)
      
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Configure your account, security, and application preferences.')).toBeInTheDocument()
    })

    test('renders sidebar navigation', () => {
      renderWithProviders(<Settings />)
      
      const tabs = [
        'Profile',
        'Security', 
        'Notifications',
        'Appearance',
        'API & Webhooks',
        'Advanced'
      ]
      
      tabs.forEach(tab => {
        expect(screen.getByText(tab)).toBeInTheDocument()
      })
    })

    test('starts with Profile tab active', () => {
      renderWithProviders(<Settings />)
      
      const profileTab = screen.getByText('Profile').closest('button')
      expect(profileTab).toHaveClass('bg-blue-100', 'text-blue-700')
      
      expect(screen.getByText('Profile Information')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    test('switches between tabs correctly', () => {
      renderWithProviders(<Settings />)
      
      // Start on Profile tab
      expect(screen.getByText('Profile Information')).toBeInTheDocument()
      
      // Click Security tab
      fireEvent.click(screen.getByText('Security'))
      expect(screen.getByText('Security Settings')).toBeInTheDocument()
      
      // Click Notifications tab
      fireEvent.click(screen.getByText('Notifications'))
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument()
      
      // Click Appearance tab
      fireEvent.click(screen.getByText('Appearance'))
      expect(screen.getByText('Appearance & Language')).toBeInTheDocument()
      
      // Click API tab
      fireEvent.click(screen.getByText('API & Webhooks'))
      expect(screen.getByText('API & Webhooks')).toBeInTheDocument()
      
      // Click Advanced tab
      fireEvent.click(screen.getByText('Advanced'))
      expect(screen.getByText('Advanced Settings')).toBeInTheDocument()
    })

    test('applies correct styling to active tab', () => {
      renderWithProviders(<Settings />)
      
      // Profile should be active by default
      const profileTab = screen.getByText('Profile').closest('button')
      expect(profileTab).toHaveClass('bg-blue-100', 'text-blue-700')
      
      // Security should be inactive
      const securityTab = screen.getByText('Security').closest('button')
      expect(securityTab).toHaveClass('text-gray-600')
    })

    test('tab icons are displayed correctly', () => {
      renderWithProviders(<Settings />)
      
      // Each tab should have an icon (represented by SVG elements)
      const tabs = screen.getAllByRole('button').filter(button => 
        ['Profile', 'Security', 'Notifications', 'Appearance', 'API & Webhooks', 'Advanced']
          .includes(button.textContent)
      )
      
      expect(tabs.length).toBe(6)
      tabs.forEach(tab => {
        const svg = tab.querySelector('svg')
        expect(svg).toBeInTheDocument()
      })
    })
  })

  describe('Profile Tab', () => {
    test('displays profile form fields', () => {
      renderWithProviders(<Settings />)
      
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Company')).toBeInTheDocument()
      expect(screen.getByLabelText('Timezone')).toBeInTheDocument()
    })

    test('profile form has default values', () => {
      renderWithProviders(<Settings />)
      
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
      expect(screen.getByDisplayValue('UTC')).toBeInTheDocument()
    })

    test('profile form fields are editable', () => {
      renderWithProviders(<Settings />)
      
      const nameField = screen.getByLabelText('Full Name')
      fireEvent.change(nameField, { target: { value: 'Jane Smith' } })
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
    })

    test('timezone dropdown has options', () => {
      renderWithProviders(<Settings />)
      
      const timezoneSelect = screen.getByLabelText('Timezone')
      expect(screen.getByText('UTC')).toBeInTheDocument()
      expect(screen.getByText('Eastern Time')).toBeInTheDocument()
      expect(screen.getByText('Pacific Time')).toBeInTheDocument()
      expect(screen.getByText('GMT')).toBeInTheDocument()
    })
  })

  describe('Security Tab', () => {
    test('displays security settings', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
      expect(screen.getByText('Add an extra layer of security to your account')).toBeInTheDocument()
      expect(screen.getByLabelText('IP Whitelist')).toBeInTheDocument()
      expect(screen.getByText('Change Password')).toBeInTheDocument()
    })

    test('2FA toggle works correctly', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Security'))
      
      const twoFactorToggle = screen.getByRole('checkbox', { name: /twoFactorEnabled/i })
      expect(twoFactorToggle).toBeChecked() // Default is enabled
      
      fireEvent.click(twoFactorToggle)
      expect(twoFactorToggle).not.toBeChecked()
    })

    test('IP whitelist textarea is functional', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Security'))
      
      const ipWhitelistField = screen.getByLabelText('IP Whitelist')
      fireEvent.change(ipWhitelistField, { target: { value: '192.168.1.1\n10.0.0.1' } })
      expect(screen.getByDisplayValue('192.168.1.1\n10.0.0.1')).toBeInTheDocument()
    })
  })

  describe('Notifications Tab', () => {
    test('displays notification preferences', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('Email Notifications')).toBeInTheDocument()
      expect(screen.getByText('SMS Notifications')).toBeInTheDocument()
      expect(screen.getByText('Webhook Notifications')).toBeInTheDocument()
      expect(screen.getByLabelText('Alert Threshold')).toBeInTheDocument()
    })

    test('notification toggles work correctly', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Notifications'))
      
      const emailToggle = screen.getByRole('checkbox', { name: /emailNotifications/i })
      const smsToggle = screen.getByRole('checkbox', { name: /smsNotifications/i })
      const webhookToggle = screen.getByRole('checkbox', { name: /webhookNotifications/i })
      
      expect(emailToggle).toBeChecked() // Default enabled
      expect(smsToggle).not.toBeChecked() // Default disabled
      expect(webhookToggle).toBeChecked() // Default enabled
      
      fireEvent.click(emailToggle)
      expect(emailToggle).not.toBeChecked()
    })

    test('alert threshold input works', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Notifications'))
      
      const alertThresholdField = screen.getByLabelText('Alert Threshold')
      fireEvent.change(alertThresholdField, { target: { value: '5000' } })
      expect(screen.getByDisplayValue('5000')).toBeInTheDocument()
    })
  })

  describe('Appearance Tab', () => {
    test('displays appearance settings', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Appearance'))
      
      expect(screen.getByLabelText('Theme')).toBeInTheDocument()
      expect(screen.getByLabelText('Language')).toBeInTheDocument()
      expect(screen.getByLabelText('Date Format')).toBeInTheDocument()
    })

    test('theme selector has options', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Appearance'))
      
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('Auto (System)')).toBeInTheDocument()
    })

    test('language selector has options', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Appearance'))
      
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('Spanish')).toBeInTheDocument()
      expect(screen.getByText('French')).toBeInTheDocument()
      expect(screen.getByText('German')).toBeInTheDocument()
    })

    test('date format selector has options', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Appearance'))
      
      expect(screen.getByText('MM/DD/YYYY')).toBeInTheDocument()
      expect(screen.getByText('DD/MM/YYYY')).toBeInTheDocument()
      expect(screen.getByText('YYYY-MM-DD')).toBeInTheDocument()
    })
  })

  describe('API & Webhooks Tab', () => {
    test('displays API settings', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('API & Webhooks'))
      
      expect(screen.getByText('API Access')).toBeInTheDocument()
      expect(screen.getByText('Webhooks')).toBeInTheDocument()
      expect(screen.getByLabelText('API Key')).toBeInTheDocument()
      expect(screen.getByLabelText('Webhook Secret')).toBeInTheDocument()
    })

    test('API key is masked by default', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('API & Webhooks'))
      
      const apiKeyField = screen.getByLabelText('API Key')
      expect(apiKeyField).toHaveAttribute('type', 'password')
    })

    test('API key visibility toggle works', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('API & Webhooks'))
      
      const apiKeyField = screen.getByLabelText('API Key')
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('text-gray-400')
      )
      
      // Find the eye icon button
      const eyeButton = toggleButtons.find(button => button.closest('.flex').querySelector('input[type="password"]'))
      if (eyeButton) {
        fireEvent.click(eyeButton)
        expect(apiKeyField).toHaveAttribute('type', 'text')
      }
    })

    test('API access toggle works', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('API & Webhooks'))
      
      const apiAccessToggle = screen.getByRole('checkbox', { name: /apiAccessEnabled/i })
      expect(apiAccessToggle).toBeChecked() // Default enabled
      
      fireEvent.click(apiAccessToggle)
      expect(apiAccessToggle).not.toBeChecked()
    })

    test('regenerate API key button works', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('API & Webhooks'))
      
      const regenerateButton = screen.getByText('Regenerate Key')
      expect(regenerateButton).toBeInTheDocument()
      
      // Mock window.confirm
      window.confirm = jest.fn(() => true)
      window.alert = jest.fn()
      
      fireEvent.click(regenerateButton)
      expect(window.confirm).toHaveBeenCalled()
    })
  })

  describe('Advanced Tab', () => {
    test('displays advanced settings', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Advanced'))
      
      expect(screen.getByLabelText('Data Retention (Days)')).toBeInTheDocument()
      expect(screen.getByLabelText('Max Requests/Second')).toBeInTheDocument()
      expect(screen.getByText('Auto-Block Suspicious Traffic')).toBeInTheDocument()
      expect(screen.getByText('Geo-Blocking')).toBeInTheDocument()
      expect(screen.getByText('Custom Rules Engine')).toBeInTheDocument()
    })

    test('advanced toggles work correctly', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Advanced'))
      
      const autoBlockToggle = screen.getByRole('checkbox', { name: /autoBlockEnabled/i })
      const geoBlockingToggle = screen.getByRole('checkbox', { name: /geoBlocking/i })
      const customRulesToggle = screen.getByRole('checkbox', { name: /customRules/i })
      
      expect(autoBlockToggle).toBeChecked() // Default enabled
      expect(geoBlockingToggle).not.toBeChecked() // Default disabled
      expect(customRulesToggle).toBeChecked() // Default enabled
      
      fireEvent.click(geoBlockingToggle)
      expect(geoBlockingToggle).toBeChecked()
    })

    test('data management buttons are present', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Advanced'))
      
      expect(screen.getByText('Export Data')).toBeInTheDocument()
      expect(screen.getByText('Import Settings')).toBeInTheDocument()
      expect(screen.getByText('Delete Account')).toBeInTheDocument()
    })

    test('export data button works', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Advanced'))
      
      window.alert = jest.fn()
      
      const exportButton = screen.getByText('Export Data')
      fireEvent.click(exportButton)
      
      expect(window.alert).toHaveBeenCalledWith('Data export started. You will receive an email when ready.')
    })
  })

  describe('Save Functionality', () => {
    test('displays save and reset buttons', () => {
      renderWithProviders(<Settings />)
      
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument()
    })

    test('save button works correctly', () => {
      renderWithProviders(<Settings />)
      
      window.alert = jest.fn()
      
      const saveButton = screen.getByText('Save Changes')
      fireEvent.click(saveButton)
      
      expect(window.alert).toHaveBeenCalledWith('Settings saved successfully!')
    })

    test('save button has proper styling', () => {
      renderWithProviders(<Settings />)
      
      const saveButton = screen.getByText('Save Changes')
      const buttonElement = saveButton.closest('button')
      
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

  describe('Responsive Design', () => {
    test('uses responsive layout classes', () => {
      renderWithProviders(<Settings />)
      
      // Check for responsive flex layout
      const mainContainer = screen.getByText('Settings').closest('.space-y-6')
      expect(mainContainer).toBeInTheDocument()
      
      // Should have responsive flex container
      const flexContainer = document.querySelector('.flex-col.lg\\:flex-row')
      expect(flexContainer).toBeInTheDocument()
    })

    test('profile form uses responsive grid', () => {
      renderWithProviders(<Settings />)
      
      const profileGrid = screen.getByLabelText('Full Name').closest('.grid')
      expect(profileGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2')
    })
  })

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      renderWithProviders(<Settings />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Settings')
      
      // Tab content should have h3 headings
      fireEvent.click(screen.getByText('Security'))
      const securityHeading = screen.getByRole('heading', { level: 3 })
      expect(securityHeading).toHaveTextContent('Security Settings')
    })

    test('form labels are properly associated', () => {
      renderWithProviders(<Settings />)
      
      const nameField = screen.getByLabelText('Full Name')
      const emailField = screen.getByLabelText('Email Address')
      const companyField = screen.getByLabelText('Company')
      
      expect(nameField).toBeInTheDocument()
      expect(emailField).toBeInTheDocument()
      expect(companyField).toBeInTheDocument()
    })

    test('navigation is keyboard accessible', () => {
      renderWithProviders(<Settings />)
      
      const tabButtons = screen.getAllByRole('button').filter(button => 
        ['Profile', 'Security', 'Notifications', 'Appearance', 'API & Webhooks', 'Advanced']
          .includes(button.textContent)
      )
      
      tabButtons.forEach(tab => {
        expect(tab).toBeEnabled()
      })
    })

    test('sets proper page title via Helmet', () => {
      renderWithProviders(<Settings />)
      
      expect(document.title).toContain('Settings')
    })
  })

  describe('State Management', () => {
    test('form state updates correctly', () => {
      renderWithProviders(<Settings />)
      
      const nameField = screen.getByLabelText('Full Name')
      fireEvent.change(nameField, { target: { value: 'Updated Name' } })
      
      expect(screen.getByDisplayValue('Updated Name')).toBeInTheDocument()
    })

    test('toggle states update correctly', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Security'))
      
      const twoFactorToggle = screen.getByRole('checkbox', { name: /twoFactorEnabled/i })
      const initialState = twoFactorToggle.checked
      
      fireEvent.click(twoFactorToggle)
      expect(twoFactorToggle.checked).toBe(!initialState)
    })
  })

  describe('User Experience', () => {
    test('form fields have proper placeholder text and help text', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Only these IPs will be able to access your dashboard')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Notifications'))
      expect(screen.getByText('Send alert when traffic exceeds this threshold')).toBeInTheDocument()
    })

    test('dangerous actions have warning styling', () => {
      renderWithProviders(<Settings />)
      
      fireEvent.click(screen.getByText('Advanced'))
      
      const deleteButton = screen.getByText('Delete Account')
      const buttonElement = deleteButton.closest('button')
      
      expect(buttonElement).toHaveClass('text-red-700', 'border-red-300', 'hover:bg-red-50')
    })
  })
})
