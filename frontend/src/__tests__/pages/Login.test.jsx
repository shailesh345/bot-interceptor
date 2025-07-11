import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockInitialAuthState } from '../test-utils';
import Login from '../../pages/auth/Login';
import { loginUser } from '../../store/slices/authSlice';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the auth slice action
jest.mock('../../store/slices/authSlice', () => ({
  ...jest.requireActual('../../store/slices/authSlice'),
  loginUser: jest.fn(),
}));

describe('Login Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with all required elements', () => {
    renderWithProviders(<Login />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    // Check page title and description
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByText(/create a new account/)).toBeInTheDocument();

    // Check form fields
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Check form elements
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    
    // Check link to register
    expect(screen.getByRole('link', { name: /create a new account/i })).toHaveAttribute('href', '/register');
  });

  test('validates email field correctly', async () => {
    renderWithProviders(<Login />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Test empty email
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // Test invalid email format
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    // Test valid email
    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await waitFor(() => {
      expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
    });
  });

  test('validates password field correctly', async () => {
    renderWithProviders(<Login />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Test empty password
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    // Test short password
    await user.type(passwordInput, '12345');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    // Test valid password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'validpassword123');
    await waitFor(() => {
      expect(screen.queryByText('Password must be at least 6 characters')).not.toBeInTheDocument();
    });
  });

  test('toggles password visibility', async () => {
    renderWithProviders(<Login />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    // Password should be hidden by default
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click to hide password again
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('submits form with valid data', async () => {
    const mockLoginUser = loginUser;
    mockLoginUser.mockResolvedValue({ type: 'auth/login/fulfilled' });

    renderWithProviders(<Login />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill form with valid data
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Check if loginUser was called with correct data
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Check if navigation occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays loading state during submission', () => {
    const loadingState = { ...mockInitialAuthState, loading: true };
    
    renderWithProviders(<Login />, {
      preloadedState: { auth: loadingState },
    });

    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Submit button should be disabled
    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toBeDisabled();
  });

  test('displays error message when login fails', () => {
    const errorState = {
      ...mockInitialAuthState,
      error: 'Invalid email or password',
    };

    renderWithProviders(<Login />, {
      preloadedState: { auth: errorState },
    });

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  test('handles remember me checkbox', async () => {
    renderWithProviders(<Login />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    
    // Should be unchecked by default
    expect(rememberMeCheckbox).not.toBeChecked();

    // Check the checkbox
    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });

  test('navigates to forgot password page', () => {
    renderWithProviders(<Login />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const forgotPasswordLink = screen.getByRole('link', { name: /forgot your password/i });
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  test('handles failed login submission', async () => {
    const mockLoginUser = loginUser;
    mockLoginUser.mockResolvedValue({ type: 'auth/login/rejected' });

    renderWithProviders(<Login />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // Should not navigate on failed login
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('accessibility - form has proper labels and structure', () => {
    renderWithProviders(<Login />, {
      preloadedState: { auth: mockInitialAuthState },
    });

    // Check ARIA labels and form structure
    const form = screen.getByRole('form') || screen.getByTestId('login-form');
    expect(form).toBeInTheDocument();

    // Check that all inputs have proper labels
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Sign in to your account');
  });
});
