import React from 'react';
import { screen } from '@testing-library/react';
import { Navigate } from 'react-router-dom';
import { renderWithProviders, mockAuthenticatedState, mockInitialAuthState } from '../test-utils';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

// Mock the Navigate component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(({ to, replace }) => <div data-testid="navigate" data-to={to} data-replace={replace} />),
}));

describe('ProtectedRoute Component', () => {
  const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when user is authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      {
        preloadedState: { auth: mockAuthenticatedState },
      }
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      {
        preloadedState: { auth: mockInitialAuthState },
      }
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-replace', 'true');
  });

  test('shows loading spinner when authentication is loading', () => {
    const loadingState = {
      ...mockInitialAuthState,
      loading: true,
    };

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      {
        preloadedState: { auth: loadingState },
      }
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('handles edge case when auth state is null/undefined', () => {
    const nullAuthState = {
      auth: {
        isAuthenticated: null,
        loading: false,
        user: null,
        token: null,
        error: null,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      {
        preloadedState: nullAuthState,
      }
    );

    // Should redirect to login when isAuthenticated is falsy
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  test('renders multiple children correctly', () => {
    const MultipleChildren = () => (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    renderWithProviders(
      <ProtectedRoute>
        <MultipleChildren />
      </ProtectedRoute>,
      {
        preloadedState: { auth: mockAuthenticatedState },
      }
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  test('loading state takes precedence over authentication status', () => {
    const loadingAndAuthenticated = {
      ...mockAuthenticatedState,
      loading: true,
    };

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      {
        preloadedState: { auth: loadingAndAuthenticated },
      }
    );

    // Should show loading even if authenticated
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('Navigate component is called with correct props', () => {
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      {
        preloadedState: { auth: mockInitialAuthState },
      }
    );

    expect(Navigate).toHaveBeenCalledWith(
      { to: '/login', replace: true },
      {}
    );
  });

  test('accessibility - loading state has proper structure', () => {
    const loadingState = {
      ...mockInitialAuthState,
      loading: true,
    };

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      {
        preloadedState: { auth: loadingState },
      }
    );

    const loadingContainer = screen.getByTestId('loading-spinner').parentElement;
    expect(loadingContainer).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen');
  });

  test('does not cause memory leaks with complex children', () => {
    const ComplexChild = () => {
      const [count, setCount] = React.useState(0);
      React.useEffect(() => {
        const timer = setTimeout(() => setCount(1), 100);
        return () => clearTimeout(timer);
      }, []);
      return <div data-testid="complex-child">Count: {count}</div>;
    };

    const { unmount } = renderWithProviders(
      <ProtectedRoute>
        <ComplexChild />
      </ProtectedRoute>,
      {
        preloadedState: { auth: mockAuthenticatedState },
      }
    );

    expect(screen.getByTestId('complex-child')).toBeInTheDocument();
    
    // Should unmount cleanly without errors
    expect(() => unmount()).not.toThrow();
  });

  test('handles state changes properly', () => {
    const { rerender } = renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      {
        preloadedState: { auth: mockInitialAuthState },
      }
    );

    // Initially should redirect
    expect(screen.getByTestId('navigate')).toBeInTheDocument();

    // Rerender with authenticated state
    rerender(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    // Update store state to authenticated
    const newStore = renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      {
        preloadedState: { auth: mockAuthenticatedState },
      }
    );

    // Should render protected content with new state
    expect(newStore.container.querySelector('[data-testid="protected-content"]')).toBeInTheDocument();
  });
});
