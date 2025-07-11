import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockInitialAuthState } from '../test-utils';
import Register from '../../pages/auth/Register';
import { registerUser } from '../../store/slices/authSlice';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the auth slice action
jest.mock('../../store/slices/authSlice', () => ({
  ...jest.requireActual('../../store/slices/authSlice'),
  registerUser: jest.fn(),
}));

describe('Register Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form with all required elements', () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    // Check page title and branding
    expect(screen.getByText('Traffic Interceptor')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText(/Already have an account/)).toBeInTheDocument();

    // Check form fields
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    
    // Check form elements
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/terms and conditions/i)).toBeInTheDocument();
    
    // Check link to login
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });

  test('validates first name field', async () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const firstNameInput = screen.getByLabelText(/first name/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Test empty first name
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });

    // Test too short first name
    await user.type(firstNameInput, 'A');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument();
    });

    // Test valid first name
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'John');
    await waitFor(() => {
      expect(screen.queryByText('First name must be at least 2 characters')).not.toBeInTheDocument();
    });
  });

  test('validates last name field', async () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const lastNameInput = screen.getByLabelText(/last name/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Test empty last name
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
    });

    // Test too short last name
    await user.type(lastNameInput, 'D');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Last name must be at least 2 characters')).toBeInTheDocument();
    });

    // Test valid last name
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Doe');
    await waitFor(() => {
      expect(screen.queryByText('Last name must be at least 2 characters')).not.toBeInTheDocument();
    });
  });

  test('validates email field', async () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Test empty email
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // Test invalid email format
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    // Test valid email
    await user.clear(emailInput);
    await user.type(emailInput, 'john.doe@example.com');
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });
  });

  test('validates password field and shows strength indicator', async () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Test empty password
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    // Test weak password
    await user.type(passwordInput, 'weak');
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    // Test stronger password and strength indicator
    await user.clear(passwordInput);
    await user.type(passwordInput, 'WeakPass123!');
    
    // Should show password strength indicator
    await waitFor(() => {
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });

  test('validates password confirmation', async () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Set password
    await user.type(passwordInput, 'ValidPassword123!');
    
    // Test mismatched confirmation
    await user.type(confirmPasswordInput, 'DifferentPassword123!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    // Test matching passwords
    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, 'ValidPassword123!');
    
    await waitFor(() => {
      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });
  });

  test('toggles password visibility', async () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i });
    const passwordToggle = toggleButtons[0];

    // Password should be hidden by default
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click to hide password again
    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('requires terms and conditions acceptance', async () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const termsCheckbox = screen.getByLabelText(/terms and conditions/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill all required fields
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'ValidPassword123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

    // Submit without accepting terms
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('You must accept the terms and conditions')).toBeInTheDocument();
    });

    // Accept terms
    await user.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();
    
    await waitFor(() => {
      expect(screen.queryByText('You must accept the terms and conditions')).not.toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const mockRegisterUser = registerUser;
    mockRegisterUser.mockResolvedValue({ type: 'auth/register/fulfilled' });

    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    // Fill form with valid data
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'ValidPassword123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');
    await user.click(screen.getByLabelText(/terms and conditions/i));

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    // Check if registerUser was called with correct data
    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'ValidPassword123!',
        confirmPassword: 'ValidPassword123!',
        acceptedTerms: true,
      });
    });

    // Check if navigation occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays loading state during submission', () => {
    const loadingState = { ...mockInitialAuthState, loading: true };
    
    renderWithProviders(<Register />, {
      preloadedState: { auth: loadingState },
    });

    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Submit button should be disabled and show loading text
    const submitButton = screen.getByRole('button', { name: /creating account/i });
    expect(submitButton).toBeDisabled();
  });

  test('displays error message when registration fails', () => {
    const errorState = {
      ...mockInitialAuthState,
      error: 'Email already exists',
    };

    renderWithProviders(<Register />, {
      preloadedState: { auth: errorState },
    });

    expect(screen.getByText('Email already exists')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  test('resets form after successful registration', async () => {
    const mockRegisterUser = registerUser;
    mockRegisterUser.mockResolvedValue({ type: 'auth/register/fulfilled' });

    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const firstNameInput = screen.getByLabelText(/first name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    // Fill and submit form
    await user.type(firstNameInput, 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(emailInput, 'john.doe@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'ValidPassword123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');
    await user.click(screen.getByLabelText(/terms and conditions/i));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Form should be reset after successful submission
    await waitFor(() => {
      expect(firstNameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
    });
  });

  test('password strength indicator works correctly', async () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const passwordInput = screen.getByLabelText(/^password$/i);

    // Test weak password
    await user.type(passwordInput, 'weak');
    await waitFor(() => {
      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    // Test fair password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Password1');
    await waitFor(() => {
      expect(screen.getByText('Fair')).toBeInTheDocument();
    });

    // Test good password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Password123');
    await waitFor(() => {
      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    // Test strong password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Password123!');
    await waitFor(() => {
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });

  test('accessibility - form has proper labels and structure', () => {
    renderWithProviders(<Register />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    // Check that all inputs have proper labels
    expect(screen.getByLabelText(/first name/i)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/last name/i)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password');

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Create your account');

    // Check checkbox accessibility
    const termsCheckbox = screen.getByLabelText(/terms and conditions/i);
    expect(termsCheckbox).toHaveAttribute('type', 'checkbox');
  });
});
