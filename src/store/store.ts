import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import airportsReducer from './airportsSlice';
import flightsReducer from './flightsSlice';
import priceCalendarReducer from './priceCalendarSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    airports: airportsReducer,
    flights: flightsReducer,
    priceCalendar: priceCalendarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 