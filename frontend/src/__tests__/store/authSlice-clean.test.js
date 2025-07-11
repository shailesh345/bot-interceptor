import authSlice, { 
  loginUser, 
  registerUser, 
  logoutUser,
  clearError 
} from '../../store/slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import mockAPI from '../../services/mockAPI';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('../../services/mockAPI');
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('authSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    test('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    });
  });

  describe('synchronous actions', () => {
    test('clearError should clear error state', () => {
      // Set an error first
      store.dispatch({ type: 'auth/login/rejected', payload: 'Login failed' });
      expect(store.getState().auth.error).toBe('Login failed');

      // Clear the error
      store.dispatch(clearError());
      expect(store.getState().auth.error).toBeNull();
    });
  });

  describe('loginUser async thunk', () => {
    const mockUser = {
      id: 'user_1234567890',
      email: 'demo@example.com',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
      isVerified: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: new Date().toISOString(),
      tenant: {
        id: 'tenant_1234567890',
        name: "John's Organization",
        slug: 'johndoe-org',
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
      },
    };

    const mockLoginResponse = {
      data: {
        user: mockUser,
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      },
    };

    test('should handle successful login', async () => {
      mockAPI.login.mockResolvedValue(mockLoginResponse);

      const credentials = { email: 'demo@example.com', password: 'password' };
      await store.dispatch(loginUser(credentials));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('mock_access_token');
      expect(state.refreshToken).toBe('mock_refresh_token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      expect(mockAPI.login).toHaveBeenCalledWith(credentials);
      expect(toast.success).toHaveBeenCalledWith('Login successful!');
    });

    test('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials';
      mockAPI.login.mockRejectedValue(new Error(errorMessage));

      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      await store.dispatch(loginUser(credentials));

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    test('should set loading state during login', () => {
      mockAPI.login.mockImplementation(() => new Promise(() => {})); // Never resolves

      store.dispatch(loginUser({ email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
    });
  });

  describe('registerUser async thunk', () => {
    const mockUser = {
      id: 'user_1234567890',
      email: 'newuser@example.com',
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: new Date().toISOString(),
      tenant: {
        id: 'tenant_1234567890',
        name: "New User's Organization",
        slug: 'newuser-org',
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
      },
    };

    const mockRegisterResponse = {
      data: {
        user: mockUser,
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      },
    };

    test('should handle successful registration', async () => {
      mockAPI.register.mockResolvedValue(mockRegisterResponse);

      const userData = {
        first_name: 'New',
        last_name: 'User',
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      };

      await store.dispatch(registerUser(userData));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('mock_access_token');
      expect(state.refreshToken).toBe('mock_refresh_token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      expect(mockAPI.register).toHaveBeenCalledWith(userData);
      expect(toast.success).toHaveBeenCalledWith('Registration successful!');
    });

    test('should handle registration failure', async () => {
      const errorMessage = 'Email already exists';
      mockAPI.register.mockRejectedValue(new Error(errorMessage));

      const userData = {
        first_name: 'New',
        last_name: 'User',
        email: 'existing@example.com',
        username: 'existing',
        password: 'password123',
      };

      await store.dispatch(registerUser(userData));

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    test('should set loading state during registration', () => {
      mockAPI.register.mockImplementation(() => new Promise(() => {})); // Never resolves

      const userData = {
        first_name: 'New',
        last_name: 'User',
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      };

      store.dispatch(registerUser(userData));

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
    });
  });

  describe('logoutUser async thunk', () => {
    test('should handle successful logout', async () => {
      // First set authenticated state
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: '1', email: 'test@example.com' },
          access_token: 'test-token',
          refresh_token: 'test-refresh',
        },
      });

      // Then logout
      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
    });
  });

  describe('edge cases', () => {
    test('should handle missing error message in rejected actions', () => {
      store.dispatch({ type: 'auth/login/rejected', payload: undefined });
      const state = store.getState().auth;
      expect(state.error).toBeUndefined();
    });

    test('should handle non-Error objects in rejected actions', () => {
      store.dispatch({ type: 'auth/login/rejected', payload: 'String error' });
      const state = store.getState().auth;
      expect(state.error).toBe('String error');
    });
  });

  describe('reducer edge cases', () => {
    test('should handle unknown action types gracefully', () => {
      const initialState = store.getState().auth;
      store.dispatch({ type: 'UNKNOWN_ACTION' });
      const newState = store.getState().auth;
      expect(newState).toEqual(initialState);
    });
  });
});
