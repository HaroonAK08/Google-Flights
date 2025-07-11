import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getNearbyAirports, searchAirports, NearbyAirportsResponse, SearchAirportsResponse } from './airportsService';

export const AIRPORTS_QUERY_KEYS = {
  nearby: (lat: number, lng: number) => ['nearbyAirports', lat, lng],
  search: (query: string) => ['searchAirports', query],
};

export function useNearbyAirports(lat: number, lng: number, options?: UseQueryOptions<NearbyAirportsResponse, Error>) {
  return useQuery<NearbyAirportsResponse, Error>({
    queryKey: AIRPORTS_QUERY_KEYS.nearby(lat, lng),
    queryFn: () => getNearbyAirports(lat, lng),
    ...options,
  });
}

export function useSearchAirports(query: string, options?: UseQueryOptions<SearchAirportsResponse, Error>) {
  return useQuery<SearchAirportsResponse, Error>({
    queryKey: AIRPORTS_QUERY_KEYS.search(query),
    queryFn: () => searchAirports(query),
    enabled: !!query,
    ...options,
  });
}