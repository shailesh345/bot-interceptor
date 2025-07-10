import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import mockAPI from '../../services/mockAPI'

const initialState = {
  stats: {
    totalRequests: 0,
    botTraffic: 0,
    humanTraffic: 0,
    blockedRequests: 0,
    revenue: 0,
    topCountries: [],
    topBots: [],
    recentActivity: [],
  },
  loading: false,
  error: null,
  selectedTimeRange: '7d',
  refreshInterval: 30000, // 30 seconds
}

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (timeRange = '7d', { rejectWithValue }) => {
    try {
      const response = await mockAPI.getDashboardStats(timeRange)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard stats')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    setTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload
    },
    setRefreshInterval: (state, action) => {
      state.refreshInterval = action.payload
    },
    updateRecentActivity: (state, action) => {
      state.stats.recentActivity = [
        action.payload,
        ...state.stats.recentActivity.slice(0, 9)
      ]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setStats,
  setLoading,
  setError,
  setTimeRange,
  setRefreshInterval,
  updateRecentActivity,
} = dashboardSlice.actions

export default dashboardSlice.reducer
