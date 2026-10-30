import { NextResponse } from "next/server";
import { getCuratedEvents } from "@/lib/events/curated";
import { filterEvents } from "@/lib/events/filter";
import type { CelestialEvent, CelestialEventType } from "@/lib/events/types";
import { predictIssPasses } from "@/lib/iss/passes";
import { fetchUpcomingLaunches } from "@/lib/launches/ll2";
import { getMoonPhaseInfo } from "@/lib/moon/phase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat") ?? "28.6139");
  const lon = Number(searchParams.get("lon") ?? "77.209");
  const query = searchParams.get("q") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const typesParam = searchParams.get("types");
  const types = typesParam
    ? (typesParam.split(",").filter(Boolean) as CelestialEventType[])
    : undefined;

  const warnings: string[] = [];
  const events: CelestialEvent[] = [...getCuratedEvents(2026)];

  const moon = getMoonPhaseInfo(new Date());
  events.push({
    id: `moon-${moon.date.slice(0, 10)}`,
    type: "moon_phase",
    title: `Moon: ${moon.phaseName}`,
    description: moon.explanation,
    startTime: moon.date,
    source: moon.source,
    dataProvenance: "calculated",
    metadata: {
      illumination: moon.illumination,
      phaseAngleDeg: moon.phaseAngleDeg,
    },
  });

  const launches = await fetchUpcomingLaunches(10);
  events.push(...launches.events);
  if (launches.error) warnings.push(launches.error);
  if (launches.cached) warnings.push("Launch data may be served from short-lived cache.");

  const iss = await predictIssPasses(lat, lon, 48);
  if (iss.warning) warnings.push(iss.warning);
  for (const pass of iss.passes) {
    events.push({
      id: pass.id,
      type: "iss_pass",
      title: "ISS pass",
      description: `${pass.note} Max elevation ~${pass.maxElevationDeg ?? "?"}°.`,
      startTime: pass.startTime,
      endTime: pass.endTime,
      source: pass.source,
      locationConstraint: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
      dataProvenance: "calculated",
      metadata: {
        maxElevationDeg: pass.maxElevationDeg,
        maxTime: pass.maxTime,
      },
    });
  }

  const filtered = filterEvents(events, { types, query, from, to });

  return NextResponse.json({
    events: filtered,
    moon,
    warnings,
    observer: { latitude: lat, longitude: lon },
  });
}
