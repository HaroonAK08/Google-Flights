import { apiFetch } from './baseApi';

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type SortBy = 'best' | 'price_high' | 'fastest' | 'outbound_take_off_time' | 'outbound_landing_time' | 'return_take_off_time' | 'return_landing_time';

export interface FlightSearchParams {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  date: string;
  returnDate?: string;
  cabinClass?: CabinClass;
  adults?: number;
  childrens?: number;
  infants?: number;
  sortBy?: SortBy;
  currency?: string;
  market?: string;
  countryCode?: string;
}

export interface FlightSegment {
  id: string;
  origin: any;
  destination: any;
  departure: string;
  arrival: string;
  durationInMinutes: number;
  flightNumber: string;
  marketingCarrier: any;
  operatingCarrier: any;
}

export interface FlightLeg {
  id: string;
  origin: any;
  destination: any;
  durationInMinutes: number;
  stopCount: number;
  departure: string;
  arrival: string;
  carriers: any;
  segments: FlightSegment[];
}

export interface FlightItinerary {
  id: string;
  price: { raw: number; formatted: string };
  legs: FlightLeg[];
  tags: string[];
}

export interface FlightSearchResponse {
  status: boolean;
  timestamp: number;
  sessionId: string;
  data: {
    context: { status: string; totalResults: number };
    itineraries: FlightItinerary[];
    messages: any[];
    filterStats: any;
    destinationImageUrl?: string;
  };
}

export const searchFlights = async (params: FlightSearchParams): Promise<FlightSearchResponse> => {
  return apiFetch<FlightSearchResponse>(
    '/api/v2/flights/searchFlights',
    params
  );
}; 