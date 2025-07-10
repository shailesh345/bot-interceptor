import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import mockAPI from '../../services/mockAPI'

const initialState = {
  domains: [],
  selectedDomain: null,
  loading: false,
  error: null,
}

export const fetchDomains = createAsyncThunk(
  'domains/fetchDomains',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockAPI.getDomains()
      return response.data.domains
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch domains')
    }
  }
)

export const createDomain = createAsyncThunk(
  'domains/createDomain',
  async (domainData, { rejectWithValue }) => {
    try {
      const response = await mockAPI.createDomain(domainData)
      return response.data.domain
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create domain')
    }
  }
)

const domainsSlice = createSlice({
  name: 'domains',
  initialState,
  reducers: {
    setDomains: (state, action) => {
      state.domains = action.payload
    },
    setSelectedDomain: (state, action) => {
      state.selectedDomain = action.payload
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
      .addCase(fetchDomains.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.loading = false
        state.domains = action.payload
      })
      .addCase(fetchDomains.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createDomain.fulfilled, (state, action) => {
        state.domains.push(action.payload)
      })
  },
})

export const { setDomains, setSelectedDomain, setLoading, setError } = domainsSlice.actions
export default domainsSlice.reducer
