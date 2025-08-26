import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await authAPI.getProfile();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user profile');
  }
});

export const updateUserProfile = createAsyncThunk('user/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await authAPI.updateProfile(profileData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update user profile');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export default userSlice.reducer;
