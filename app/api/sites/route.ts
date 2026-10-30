import { NextResponse } from "next/server";
import { sitesNear } from "@/lib/locations/curated-sites";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "lat and lon are required", sites: [] },
      { status: 400 },
    );
  }

  const sites = sitesNear(lat, lon, 6).map((site) => ({
    ...site,
    label: "Curated sample location — not a live discovery feed",
  }));

  return NextResponse.json({
    sites,
    provenance:
      "Curated demo dataset of real geographic coordinates with approximate light-pollution estimates.",
  });
}
