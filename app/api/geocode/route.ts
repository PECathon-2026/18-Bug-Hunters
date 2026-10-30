import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/weather/open-meteo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (q.trim().length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters", results: [] },
      { status: 400 },
    );
  }

  try {
    const results = await searchPlaces(q);
    return NextResponse.json({ results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Geocoding request failed";
    return NextResponse.json({ error: message, results: [] }, { status: 502 });
  }
}
