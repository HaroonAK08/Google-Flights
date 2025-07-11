import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import airportsReducer from './airportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    airports: airportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 