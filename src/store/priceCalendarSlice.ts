import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';

// Types from user schema
export interface PriceCalendarParams {
  originSkyId: string;
  destinationSkyId: string;
  fromDate: string;
  toDate?: string;
  currency: string;
}

export interface PriceCalendarState {
  params: PriceCalendarParams;
  data: any | null;
  loading: boolean;
  error: string | null;
  modalOpen: boolean;
}

const initialState: PriceCalendarState = {
  params: {
    originSkyId: 'BOM',
    destinationSkyId: 'JFK',
    fromDate: format(new Date(), 'yyyy-MM-dd'),
    toDate: '',
    currency: 'USD',
  },
  data: null,
  loading: false,
  error: null,
  modalOpen: false,
};

const priceCalendarSlice = createSlice({
  name: 'priceCalendar',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<PriceCalendarParams>>) {
      state.params = { ...state.params, ...action.payload };
    },
    setModalOpen(state, action: PayloadAction<boolean>) {
      state.modalOpen = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setData(state, action: PayloadAction<any | null>) {
      state.data = action.payload;
    },
    resetParams(state) {
      state.params = { ...initialState.params };
    },
  },
});

export const {
  setParams,
  setModalOpen,
  setLoading,
  setError,
  setData,
  resetParams,
} = priceCalendarSlice.actions;

export default priceCalendarSlice.reducer; 