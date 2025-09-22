// Authentication utilities
import { toast } from 'react-hot-toast';

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Clear authentication data
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Set authentication data
export const setAuth = (data) => {
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }
  if (data.refresh_token) {
    localStorage.setItem('refreshToken', data.refresh_token);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

// Login function
export const login = async (credentials) => {
  try {
    // Use the Vite proxy instead of direct backend URL
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || `HTTP ${response.status} Error`;
      }
      throw new Error(errorMessage);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error('Invalid response format from server');
    }
    
    console.log('🔐 Login successful, data received:', data);
    
    // Set authentication data in localStorage
    setAuth(data);
    
    // Verify token was stored
    const storedToken = localStorage.getItem('token');
    console.log('🔐 Token stored in localStorage:', storedToken ? 'YES' : 'NO');
    
    // Return data in the format expected by Redux
    return {
      user: data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token
    };
  } catch (error) {
    console.error('🔐 Login error:', error);
    toast.error(error.message || 'Login failed');
    throw error;
  }
};

// Logout function
export const logout = () => {
  clearAuth();
  toast.success('Logged out successfully');
  window.location.href = '/login';
};

// API request with authentication
export const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('No authentication token');
  }

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      clearAuth();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message === 'Authentication failed') {
      throw error;
    }
    toast.error(error.message || 'API request failed');
    throw error;
  }
};
