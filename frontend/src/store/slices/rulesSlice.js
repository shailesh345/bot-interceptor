import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { rulesAPI } from '../../services/api'

const initialState = {
  rules: [],
  selectedRule: null,
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    search: ''
  },
  testResults: null
}

// Async thunks
export const fetchRules = createAsyncThunk(
  'rules/fetchRules',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await rulesAPI.getRules(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rules')
    }
  }
)

export const fetchRule = createAsyncThunk(
  'rules/fetchRule',
  async (id, { rejectWithValue }) => {
    try {
      const response = await rulesAPI.getRule(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rule')
    }
  }
)

export const createRule = createAsyncThunk(
  'rules/createRule',
  async (ruleData, { rejectWithValue }) => {
    try {
      const response = await rulesAPI.createRule(ruleData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create rule')
    }
  }
)

export const updateRule = createAsyncThunk(
  'rules/updateRule',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await rulesAPI.updateRule(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update rule')
    }
  }
)

export const deleteRule = createAsyncThunk(
  'rules/deleteRule',
  async (id, { rejectWithValue }) => {
    try {
      await rulesAPI.deleteRule(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete rule')
    }
  }
)

export const testRule = createAsyncThunk(
  'rules/testRule',
  async ({ ruleId, sampleRequests }, { rejectWithValue }) => {
    try {
      const response = await rulesAPI.testRule(ruleId, sampleRequests)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to test rule')
    }
  }
)

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    setSelectedRule: (state, action) => {
      state.selectedRule = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    clearTestResults: (state) => {
      state.testResults = null
    },
    clearSelectedRule: (state) => {
      state.selectedRule = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch rules
      .addCase(fetchRules.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRules.fulfilled, (state, action) => {
        state.loading = false
        // Handle both direct array and wrapped response formats
        const rulesData = action.payload.rules || action.payload
        state.rules = Array.isArray(rulesData) ? rulesData : []
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch single rule
      .addCase(fetchRule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRule.fulfilled, (state, action) => {
        state.loading = false
        state.selectedRule = action.payload
      })
      .addCase(fetchRule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create rule
      .addCase(createRule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRule.fulfilled, (state, action) => {
        state.loading = false
        // Handle both direct rule object and wrapped response formats
        const ruleData = action.payload.rule || action.payload
        if (ruleData) {
          state.rules.push(ruleData)
        }
      })
      .addCase(createRule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update rule
      .addCase(updateRule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRule.fulfilled, (state, action) => {
        state.loading = false
        const index = state.rules.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.rules[index] = action.payload
        }
        if (state.selectedRule?.id === action.payload.id) {
          state.selectedRule = action.payload
        }
      })
      .addCase(updateRule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete rule
      .addCase(deleteRule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRule.fulfilled, (state, action) => {
        state.loading = false
        state.rules = state.rules.filter(r => r.id !== action.payload)
        if (state.selectedRule?.id === action.payload) {
          state.selectedRule = null
        }
      })
      .addCase(deleteRule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Test rule
      .addCase(testRule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(testRule.fulfilled, (state, action) => {
        state.loading = false
        state.testResults = action.payload
      })
      .addCase(testRule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { 
  setSelectedRule, 
  setFilters, 
  clearError, 
  clearTestResults, 
  clearSelectedRule 
} = rulesSlice.actions

export default rulesSlice.reducer
