import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mockAPI from '../../services/mockAPI';

export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async () => {
  const response = await mockAPI.fetchUserProfile();
  return response;
});

export const updateUserProfile = createAsyncThunk('user/updateProfile', async (profileData) => {
  const response = await mockAPI.updateUserProfile(profileData);
  return response;
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
