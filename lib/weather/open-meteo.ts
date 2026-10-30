import { OPEN_METEO_ATTRIBUTION } from "@/lib/constants";
import type { GeoPlace, WeatherForecast } from "@/lib/weather/types";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

type GeocodeApiResult = {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
    timezone?: string;
  }>;
};

type ForecastApiResult = {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly?: {
    time: string[];
    cloud_cover?: Array<number | null>;
    relative_humidity_2m?: Array<number | null>;
    visibility?: Array<number | null>;
    temperature_2m?: Array<number | null>;
  };
};

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: signal ?? controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Upstream responded with ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchPlaces(query: string): Promise<GeoPlace[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const data = await fetchJson<GeocodeApiResult>(url.toString());
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
    timezone: r.timezone,
  }));
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
): Promise<WeatherForecast> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid coordinates");
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Coordinates out of range");
  }

  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "hourly",
    "cloud_cover,relative_humidity_2m,visibility,temperature_2m",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "3");

  const data = await fetchJson<ForecastApiResult>(url.toString());
  const times = data.hourly?.time ?? [];
  const hourly = times.map((time, i) => ({
    time,
    cloudCover: data.hourly?.cloud_cover?.[i] ?? null,
    humidity: data.hourly?.relative_humidity_2m?.[i] ?? null,
    visibilityMeters: data.hourly?.visibility?.[i] ?? null,
    temperatureC: data.hourly?.temperature_2m?.[i] ?? null,
  }));

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    retrievedAt: new Date().toISOString(),
    hourly,
    source: "Open-Meteo",
    attribution: OPEN_METEO_ATTRIBUTION,
  };
}

/** Pick the hour closest to "now" in the forecast series. */
export function pickNearestHour(forecast: WeatherForecast, when = new Date()) {
  if (forecast.hourly.length === 0) return null;
  const target = when.getTime();
  let best = forecast.hourly[0];
  let bestDiff = Math.abs(new Date(best.time).getTime() - target);
  for (const point of forecast.hourly) {
    const diff = Math.abs(new Date(point.time).getTime() - target);
    if (diff < bestDiff) {
      best = point;
      bestDiff = diff;
    }
  }
  return best;
}

export function findFavorableWindows(
  forecast: WeatherForecast,
  moonIllumination?: number | null,
  lightPollution?: number | null,
) {
  // Imported dynamically-friendly pure scoring done by caller typically;
  // this helper returns hours with cloud cover under 40% when available.
  return forecast.hourly
    .filter((h) => {
      const hour = new Date(h.time).getUTCHours();
      const isNightish = hour >= 18 || hour <= 5;
      return isNightish && h.cloudCover !== null && h.cloudCover <= 40;
    })
    .slice(0, 12)
    .map((h) => ({
      time: h.time,
      cloudCover: h.cloudCover,
      humidity: h.humidity,
      visibilityMeters: h.visibilityMeters,
      moonIllumination: moonIllumination ?? null,
      lightPollution: lightPollution ?? null,
    }));
}
