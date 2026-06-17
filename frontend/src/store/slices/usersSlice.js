import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersAPI } from '../../api';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await usersAPI.getAll();
    return response.data;
  }
);

export const fetchStaffUsers = createAsyncThunk(
  'users/fetchStaffUsers',
  async () => {
    const response = await usersAPI.getStaff();
    return response.data;
  }
);

export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData) => {
    const response = await usersAPI.create(userData);
    return response.data;
  }
);

export const addStaffUser = createAsyncThunk(
  'users/addStaffUser',
  async (userData) => {
    const response = await usersAPI.createStaff(userData);
    return response.data;
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }) => {
    const response = await usersAPI.update(id, userData);
    return response.data;
  }
);

export const updateStaffUser = createAsyncThunk(
  'users/updateStaffUser',
  async ({ id, userData }) => {
    const response = await usersAPI.updateStaff(id, userData);
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id) => {
    await usersAPI.delete(id);
    return id;
  }
);

export const deleteStaffUser = createAsyncThunk(
  'users/deleteStaffUser',
  async (id) => {
    await usersAPI.deleteStaff(id);
    return id;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    staffList: [],
    loading: false,
    staffLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Staff Users
      .addCase(fetchStaffUsers.pending, (state) => {
        state.staffLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffUsers.fulfilled, (state, action) => {
        state.staffLoading = false;
        state.staffList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStaffUsers.rejected, (state, action) => {
        state.staffLoading = false;
        state.error = action.error.message;
      })
      // Add User
      .addCase(addUser.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // Add Staff User
      .addCase(addStaffUser.fulfilled, (state, action) => {
        state.staffList.push(action.payload);
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Update Staff User
      .addCase(updateStaffUser.fulfilled, (state, action) => {
        const index = state.staffList.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.staffList[index] = action.payload;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter(u => u._id !== action.payload);
      })
      // Delete Staff User
      .addCase(deleteStaffUser.fulfilled, (state, action) => {
        state.staffList = state.staffList.filter(u => u._id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
