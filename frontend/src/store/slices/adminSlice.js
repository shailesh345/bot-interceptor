import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../services/api';

export const fetchAdminData = createAsyncThunk('admin/fetchData', async (_, { rejectWithValue }) => {
  try {
    const response = await adminAPI.getUsers();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch admin data');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    settings: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.users;
        state.settings = action.payload.settings;
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default adminSlice.reducer;
