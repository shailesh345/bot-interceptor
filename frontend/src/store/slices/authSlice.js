import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'
import mockAPI from '../../services/mockAPI'
import toast from 'react-hot-toast'

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // const response = await authAPI.login(credentials)
      const response = await mockAPI.login(credentials)
      toast.success('Login successful!')
      return response.data
    } catch (error) {
      const message = error.message || 'Login failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // const response = await authAPI.register(userData)
      const response = await mockAPI.register(userData)
      toast.success('Registration successful!')
      return response.data
    } catch (error) {
      const message = error.message || 'Registration failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    // Only clear local state, do not call any API
    toast.success('Logged out successfully')
    return null
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed')
    }
  }
)

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      // const response = await authAPI.getProfile()
      const response = await mockAPI.getProfile()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      toast.success('Profile updated successfully')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action) => {
      const { user, access_token, refresh_token } = action.payload
      state.user = user
      state.token = access_token
      state.refreshToken = refresh_token
      state.isAuthenticated = true
    },
    clearCredentials: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
      })
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.access_token
      })
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setCredentials, clearCredentials } = authSlice.actions

export default authSlice.reducer
