import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Geolocation from '@react-native-community/geolocation';
import { getNearbyAirports, AirportData, NearbyAirportsResponse } from '../api/airportsService';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

interface Location {
  lat: number;
  lng: number;
}

interface AirportsState {
  location: Location | null;
  airports: AirportData[];
  loading: boolean;
  error: string | null;
}

const initialState: AirportsState = {
  location: null,
  airports: [],
  loading: false,
  error: null,
};

export const getUserLocation = createAsyncThunk<Location>(
  'airports/getUserLocation',
  async (_, { rejectWithValue }) => {
    try {
      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        let result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (result === RESULTS.GRANTED) {
          permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        } else {
          result = await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
          if (result === RESULTS.GRANTED) {
            permission = PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
          } else {
            throw new Error('Location permission denied');
          }
        }
      }
      
      if (Platform.OS === 'ios') {
        const result = await request(permission);
        if (result !== RESULTS.GRANTED) {
          throw new Error('Location permission denied');
        }
      }
      
      return new Promise<Location>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          error => {
            console.error('Geolocation error:', error);
            reject(rejectWithValue(error.message || 'Location error'));
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get location');
    }
  }
);

export const fetchNearbyAirports = createAsyncThunk<AirportData[], Location>(
  'airports/fetchNearbyAirports',
  async (location, { rejectWithValue }) => {
    try {
      const response: NearbyAirportsResponse = await getNearbyAirports(location.lat, location.lng);
      const airports: AirportData[] = [
        ...(response.data.nearby || []),
        ...(response.data.recent || []),
        ...(response.data.current ? [response.data.current] : []),
      ];
      return airports;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch airports');
    }
  }
);

const airportsSlice = createSlice({
  name: 'airports',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getUserLocation.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserLocation.fulfilled, (state, action: PayloadAction<Location>) => {
        state.location = action.payload;
        state.loading = false;
      })
      .addCase(getUserLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNearbyAirports.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyAirports.fulfilled, (state, action: PayloadAction<AirportData[]>) => {
        state.airports = action.payload;
        state.loading = false;
      })
      .addCase(fetchNearbyAirports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default airportsSlice.reducer; 