export interface PriceCalendarDay {
  day: string; // YYYY-MM-DD
  group: string; // 'low' | 'medium' | 'high'
  price: number;
}

export interface PriceCalendarGroup {
  id: string; // 'low' | 'medium' | 'high'
  label: string; // e.g. '$', '$$', '$$$'
}

export interface PriceCalendarFlights {
  noPriceLabel: string;
  groups: PriceCalendarGroup[];
  days: PriceCalendarDay[];
  currency: string;
}

export interface Root {
  status: boolean;
  timestamp: number;
  data?: {
    flights?: PriceCalendarFlights;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface PriceCalendarParams {
  originSkyId: string;
  destinationSkyId: string;
  fromDate: string;
  toDate?: string;
  currency?: string;
}

import { apiFetch } from './baseApi';

export async function getPriceCalendar(params: PriceCalendarParams): Promise<Root> {
  const { originSkyId, destinationSkyId, fromDate, toDate, currency = 'USD' } = params;
  const path = '/api/v1/flights/getPriceCalendar';
  const query: Record<string, string> = {
    originSkyId,
    destinationSkyId,
    fromDate,
    currency,
  };
  if (toDate) query.toDate = toDate;
  return apiFetch<Root>(path, query);
} 