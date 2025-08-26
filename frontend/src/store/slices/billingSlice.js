import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { billingAPI } from '../../services/api'

const initialState = {
  subscription: null,
  invoices: [],
  loading: false,
  error: null,
}

export const fetchBilling = createAsyncThunk(
  'billing/fetchBilling',
  async (_, { rejectWithValue }) => {
    try {
      const response = await billingAPI.getSubscription()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch billing')
    }
  }
)

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setSubscription: (state, action) => {
      state.subscription = action.payload
    },
    setInvoices: (state, action) => {
      state.invoices = action.payload
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
      .addCase(fetchBilling.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBilling.fulfilled, (state, action) => {
        state.loading = false
        state.subscription = action.payload.subscription
        state.invoices = action.payload.invoices
      })
      .addCase(fetchBilling.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setSubscription, setInvoices, setLoading, setError } = billingSlice.actions
export default billingSlice.reducer
