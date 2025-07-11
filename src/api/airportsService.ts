import { apiFetch } from './baseApi';

export interface AirportPresentation {
  title: string;
  suggestionTitle: string;
  subtitle: string;
}

export interface AirportNavigation {
  entityId: string;
  entityType: string;
  localizedName: string;
  relevantFlightParams: {
    skyId: string;
    entityId: string;
    flightPlaceType: string;
    localizedName: string;
  };
  relevantHotelParams: {
    entityId: string;
    entityType: string;
    localizedName: string;
  };
}

export interface AirportData {
  presentation: AirportPresentation;
  navigation: AirportNavigation;
}

export interface NearbyAirportsResponse {
  status: boolean;
  timestamp: number;
  data: {
    current: AirportData;
    nearby: AirportData[];
    recent: AirportData[];
  };
}

export interface SearchAirportsResponse {
  status: boolean;
  timestamp: number;
  data: AirportData[];
}

export const getNearbyAirports = async (lat: number, lng: number, locale = 'en-US'): Promise<NearbyAirportsResponse> => {
  return apiFetch<NearbyAirportsResponse>(
    '/api/v1/flights/getNearByAirports',
    { lat, lng, locale }
  );
};

export const searchAirports = async (query: string, locale = 'en-US'): Promise<SearchAirportsResponse> => {
  return apiFetch<SearchAirportsResponse>(
    '/api/v1/flights/searchAirport',
    { query, locale }
  );
}; 