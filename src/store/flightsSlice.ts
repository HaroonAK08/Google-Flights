import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';

export type PlaceOption = {
  label: string;
  skyId: string;
  entityId: string;
};

export const PLACES: PlaceOption[] = [
  { label: 'Mumbai (BOM)', skyId: 'BOM', entityId: '95673320' },
  { label: 'London (LOND)', skyId: 'LOND', entityId: '27544008' },
  { label: 'New York (NYCA)', skyId: 'NYCA', entityId: '27537542' },
  { label: "CapeTown", skyId: "CPT", entityId: "27539908" },
  { label: "New Zealand", skyId: "NZ", entityId: "29475342" },
  { label: "Tokyo", skyId: "TYOA", entityId: "27542089" }
];

export type FlightsSearchParams = {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  date: string;
  returnDate?: string;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first' | string;
  adults: number;
  childrens: number;
  infants: number;
  sortBy: 'best' | 'price_high' | 'fastest' | 'outbound_take_off_time' | 'outbound_landing_time' | 'return_take_off_time' | 'return_landing_time' | string;
  limit?: number;
  carriersIds?: string;
  currency: string;
  market: string;
  countryCode: string;
};

const initialState = {
  params: {
    originSkyId: 'BOM',
    destinationSkyId: 'NYCA',
    originEntityId: '95673320',
    destinationEntityId: '27537542',
    date: format(new Date(), 'yyyy-MM-dd'),
    returnDate: '',
    cabinClass: 'economy',
    adults: 1,
    childrens: 0,
    infants: 0,
    sortBy: 'best',
    limit: 0,
    carriersIds: '',
    currency: 'USD',
    market: 'en-US',
    countryCode: 'US',
  } as FlightsSearchParams,
  modalOpen: false,
};

const flightsSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<FlightsSearchParams>>) {
      state.params = { ...state.params, ...action.payload };
    },
    setModalOpen(state, action: PayloadAction<boolean>) {
      state.modalOpen = action.payload;
    },
    swapPlaces(state) {
      const {
        originSkyId,
        destinationSkyId,
        originEntityId,
        destinationEntityId,
      } = state.params;
      state.params.originSkyId = destinationSkyId;
      state.params.destinationSkyId = originSkyId;
      state.params.originEntityId = destinationEntityId;
      state.params.destinationEntityId = originEntityId;
    },
    resetParams(state) {
      state.params = { ...initialState.params };
    },
  },
});

export const { setParams, setModalOpen, swapPlaces, resetParams } = flightsSlice.actions;
export default flightsSlice.reducer; 