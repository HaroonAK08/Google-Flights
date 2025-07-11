import {API_KEYS} from "@env";

const BASE_URL = 'https://sky-scrapper.p.rapidapi.com';
const RAPIDAPI_KEY = API_KEYS.split('&&');
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'sky-scrapper.p.rapidapi.com';

export async function apiFetch<T>(path: string, params?: Record<string, any>): Promise<T> {
  let url = BASE_URL + path;
  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) search.append(key, String(value));
    });
    url += '?' + search.toString();
  }
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY[Math.floor(Math.random() * RAPIDAPI_KEY.length)],
    },
  });
  const data = await res.json()
  console.log("RESPONSE", url, data);
  if (!res.ok) {
    let message = 'API Error';
    try { message = (await res.json()).message || message; } catch {}
    throw new Error(message);
  }
  return data;
} 