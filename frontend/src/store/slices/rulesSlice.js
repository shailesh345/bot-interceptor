import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import mockAPI from '../../services/mockAPI'

const initialState = {
  rules: [],
  selectedRule: null,
  loading: false,
  error: null,
}

export const fetchRules = createAsyncThunk(
  'rules/fetchRules',
  async (domainId, { rejectWithValue }) => {
    try {
      const response = await mockAPI.getRules(domainId)
      return response.data.rules
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch rules')
    }
  }
)

export const createRule = createAsyncThunk(
  'rules/createRule',
  async ({ domainId, ruleData }, { rejectWithValue }) => {
    try {
      const response = await mockAPI.createRule(domainId, ruleData)
      return response.data.rule
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create rule')
    }
  }
)

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    setRules: (state, action) => {
      state.rules = action.payload
    },
    setSelectedRule: (state, action) => {
      state.selectedRule = action.payload
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
      .addCase(fetchRules.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRules.fulfilled, (state, action) => {
        state.loading = false
        state.rules = action.payload
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createRule.fulfilled, (state, action) => {
        state.rules.push(action.payload)
      })
  },
})

export const { setRules, setSelectedRule, setLoading, setError } = rulesSlice.actions
export default rulesSlice.reducer
