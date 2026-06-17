import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import staffReducer from './slices/staffSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    staff: staffReducer,
  },
});
