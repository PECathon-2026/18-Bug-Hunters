import type { CelestialEvent } from "@/lib/events/types";

type LL2Launch = {
  id: string;
  name: string;
  net: string;
  window_end?: string | null;
  status?: { name?: string | null } | null;
  mission?: { description?: string | null } | null;
  pad?: { name?: string | null; location?: { name?: string | null } | null } | null;
  url?: string | null;
  last_updated?: string | null;
};

type LL2Response = {
  results?: LL2Launch[];
  detail?: string;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { at: number; events: CelestialEvent[] } | null = null;

function mapLaunch(launch: LL2Launch): CelestialEvent {
  const status = launch.status?.name ?? "Unknown";
  const pad =
    [launch.pad?.name, launch.pad?.location?.name].filter(Boolean).join(", ") ||
    undefined;

  return {
    id: `ll2-${launch.id}`,
    type: "rocket_launch",
    title: launch.name,
    description:
      launch.mission?.description?.trim() ||
      `Rocket launch. Status: ${status}.`,
    startTime: launch.net,
    endTime: launch.window_end ?? undefined,
    source: "Launch Library 2 (The Space Devs)",
    sourceUrl: launch.url ?? "https://thespacedevs.com/llapi/",
    locationConstraint: pad,
    visibilityGuidance: `Status: ${status}. Launch times can slip; verify near T-0.`,
    dataProvenance: "live",
    metadata: {
      status,
      lastUpdated: launch.last_updated ?? null,
    },
  };
}

export async function fetchUpcomingLaunches(
  limit = 12,
): Promise<{ events: CelestialEvent[]; error?: string; cached: boolean }> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return { events: cache.events, cached: true };
  }

  const useDev = process.env.LL2_USE_DEV === "true";
  const base = useDev
    ? "https://lldev.thespacedevs.com/2.2.0"
    : "https://ll.thespacedevs.com/2.2.0";

  const url = new URL(`${base}/launch/upcoming/`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("mode", "list");

  const headers: HeadersInit = { Accept: "application/json" };
  if (process.env.LL2_API_TOKEN) {
    headers.Authorization = `Token ${process.env.LL2_API_TOKEN}`;
  }

  try {
    const res = await fetch(url.toString(), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as LL2Response;
      throw new Error(body.detail || `LL2 HTTP ${res.status}`);
    }
    const data = (await res.json()) as LL2Response;
    const events = (data.results ?? []).map(mapLaunch);
    cache = { at: Date.now(), events };
    return { events, cached: false };
  } catch (error) {
    if (cache) {
      return {
        events: cache.events,
        cached: true,
        error:
          error instanceof Error
            ? `${error.message} (serving cached launches)`
            : "LL2 failed (serving cache)",
      };
    }
    return {
      events: [],
      cached: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch Launch Library 2 data",
    };
  }
}
