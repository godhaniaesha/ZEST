import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { staffAPI } from '../../api';

export const fetchStaff = createAsyncThunk(
  'staff/fetchStaff',
  async () => {
    const response = await staffAPI.getAll();
    return response.data;
  }
);

export const addStaff = createAsyncThunk(
  'staff/addStaff',
  async (staffData) => {
    const response = await staffAPI.create(staffData);
    return response.data;
  }
);

export const updateStaff = createAsyncThunk(
  'staff/updateStaff',
  async ({ id, staffData }) => {
    const response = await staffAPI.update(id, staffData);
    return response.data;
  }
);

export const deleteStaff = createAsyncThunk(
  'staff/deleteStaff',
  async (id) => {
    await staffAPI.delete(id);
    return id;
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Staff
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add Staff
      .addCase(addStaff.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // Update Staff
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.list.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Delete Staff
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.list = state.list.filter(s => s._id !== action.payload);
      });
  },
});

export default staffSlice.reducer;
