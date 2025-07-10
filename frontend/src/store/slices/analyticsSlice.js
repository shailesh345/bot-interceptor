import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import mockAPI from '../../services/mockAPI'

const initialState = {
  metrics: [],
  loading: false,
  error: null,
}

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await mockAPI.getAnalytics(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch analytics')
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setMetrics: (state, action) => {
      state.metrics = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.metrics = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setMetrics, setLoading, setError } = analyticsSlice.actions
export default analyticsSlice.reducer
