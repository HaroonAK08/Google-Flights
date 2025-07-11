import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import airportsReducer from './airportsSlice';
import flightsReducer from './flightsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    airports: airportsReducer,
    flights: flightsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 