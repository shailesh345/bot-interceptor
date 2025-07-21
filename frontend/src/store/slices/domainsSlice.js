import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { domainsAPI } from '../../services/api'

const initialState = {
  domains: [],
  selectedDomain: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    search: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
}

// Async thunks
export const fetchDomains = createAsyncThunk(
  'domains/fetchDomains',
  async (_, { rejectWithValue }) => {
    try {
      const response = await domainsAPI.getDomains()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch domains')
    }
  }
)

export const fetchDomain = createAsyncThunk(
  'domains/fetchDomain',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainsAPI.getDomain(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch domain')
    }
  }
)

export const createDomain = createAsyncThunk(
  'domains/createDomain',
  async (domainData, { rejectWithValue }) => {
    try {
      const response = await domainsAPI.createDomain(domainData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create domain')
    }
  }
)

export const updateDomain = createAsyncThunk(
  'domains/updateDomain',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await domainsAPI.updateDomain(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update domain')
    }
  }
)

export const deleteDomain = createAsyncThunk(
  'domains/deleteDomain',
  async (id, { rejectWithValue }) => {
    try {
      await domainsAPI.deleteDomain(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete domain')
    }
  }
)

export const verifyDomain = createAsyncThunk(
  'domains/verifyDomain',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainsAPI.verifyDomain(id)
      return { id, verified: response.data.verified }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify domain')
    }
  }
)

const domainsSlice = createSlice({
  name: 'domains',
  initialState,
  reducers: {
    setSelectedDomain: (state, action) => {
      state.selectedDomain = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    clearSelectedDomain: (state) => {
      state.selectedDomain = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch domains
      .addCase(fetchDomains.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.loading = false
        state.domains = action.payload
        state.pagination.total = action.payload.length
      })
      .addCase(fetchDomains.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch single domain
      .addCase(fetchDomain.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDomain.fulfilled, (state, action) => {
        state.loading = false
        state.selectedDomain = action.payload
      })
      .addCase(fetchDomain.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create domain
      .addCase(createDomain.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDomain.fulfilled, (state, action) => {
        state.loading = false
        state.domains.push(action.payload)
        state.pagination.total += 1
      })
      .addCase(createDomain.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update domain
      .addCase(updateDomain.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDomain.fulfilled, (state, action) => {
        state.loading = false
        const index = state.domains.findIndex(d => d.id === action.payload.id)
        if (index !== -1) {
          state.domains[index] = action.payload
        }
        if (state.selectedDomain?.id === action.payload.id) {
          state.selectedDomain = action.payload
        }
      })
      .addCase(updateDomain.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete domain
      .addCase(deleteDomain.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteDomain.fulfilled, (state, action) => {
        state.loading = false
        state.domains = state.domains.filter(d => d.id !== action.payload)
        state.pagination.total -= 1
        if (state.selectedDomain?.id === action.payload) {
          state.selectedDomain = null
        }
      })
      .addCase(deleteDomain.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Verify domain
      .addCase(verifyDomain.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyDomain.fulfilled, (state, action) => {
        state.loading = false
        const index = state.domains.findIndex(d => d.id === action.payload.id)
        if (index !== -1) {
          state.domains[index] = { ...state.domains[index], status: 'verified', verifiedAt: new Date().toISOString() }
        }
        if (state.selectedDomain?.id === action.payload.id) {
          state.selectedDomain = { ...state.selectedDomain, status: 'verified', verifiedAt: new Date().toISOString() }
        }
      })
      .addCase(verifyDomain.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { 
  setSelectedDomain, 
  setFilters, 
  setPagination, 
  clearError, 
  clearSelectedDomain 
} = domainsSlice.actions

export default domainsSlice.reducer
