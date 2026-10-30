import { NextResponse } from "next/server";
import { fetchForecast } from "@/lib/weather/open-meteo";
import type { WeatherForecast } from "@/lib/weather/types";

// In-memory 5-minute cache keyed by 2 decimal place coordinates (~1km resolution)
const cache = new Map<string, { timestamp: number; data: WeatherForecast }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "lat and lon query parameters are required numbers" },
      { status: 400 },
    );
  }

  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  try {
    const forecast = await fetchForecast(lat, lon);
    cache.set(cacheKey, { timestamp: now, data: forecast });
    return NextResponse.json(forecast);
  } catch (error) {
    // If live fetch fails but we have stale cache, return it with a warning header
    if (cached) {
      return NextResponse.json(cached.data, {
        headers: { "X-Tsukuyomi-Warning": "Stale weather served due to API error" },
      });
    }

    const message =
      error instanceof Error ? error.message : "Weather request failed";
    const status = message.includes("out of range") || message.includes("Invalid")
      ? 400
      : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
