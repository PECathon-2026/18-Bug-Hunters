/**
 * Simplified ISS pass estimator using public TLE fetch + SGP4-like
 * approximation via satellite.js is preferred; when unavailable we document
 * limitation. This module uses a lightweight geometric estimate from
 * CelesTrak TLE when satellite.js is not installed: we still attempt TLE fetch
 * and return honest "prediction unavailable" if parsing fails.
 *
 * For MVP reliability we implement a basic rise/set scan using astronomy-engine
 * body positions for Earth satellites is not built-in, so we use TLE + a
 * minimal SGP4 port only if dependency exists.
 */

export type IssPass = {
  id: string;
  startTime: string;
  maxTime: string;
  endTime: string;
  maxElevationDeg: number | null;
  note: string;
  source: string;
  provenance: "calculated" | "unavailable";
};

export type IssPassResult = {
  passes: IssPass[];
  warning?: string;
};

/**
 * Fetch latest ISS TLE lines from CelesTrak.
 * Returns null on network/parse failure.
 */
export async function fetchIssTle(): Promise<[string, string, string] | null> {
  try {
    const res = await fetch(
      "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE",
      { headers: { Accept: "text/plain" }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 3) return null;
    return [lines[0], lines[1], lines[2]];
  } catch {
    return null;
  }
}

/**
 * Without a full SGP4 dependency in the bundle yet, provide a transparent
 * stub that still wires location into the API contract. When satellite
 * propagation is unavailable, return empty passes with an explanation.
 * Watchtower/Celestial UI must show this honestly.
 */
export async function predictIssPasses(
  latitude: number,
  longitude: number,
  hoursAhead = 48,
): Promise<IssPassResult> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    return {
      passes: [],
      warning: "Invalid observer coordinates for ISS prediction.",
    };
  }

  const tle = await fetchIssTle();
  if (!tle) {
    return {
      passes: [],
      warning:
        "ISS TLE could not be retrieved from CelesTrak. Pass predictions are unavailable right now.",
    };
  }

  // Attempt dynamic import of satellite.js if present.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sat = (await import("satellite.js")) as any;
    const satrec = sat.twoline2satrec(tle[1], tle[2]);
    const observerGd = {
      longitude: sat.degreesToRadians(longitude),
      latitude: sat.degreesToRadians(latitude),
      height: 0,
    };

    const passes: IssPass[] = [];
    const start = new Date();
    const stepMs = 60_000;
    const end = start.getTime() + hoursAhead * 3600_000;
    let inPass = false;
    let passStart: Date | null = null;
    let maxEl = -Infinity;
    let maxTime: Date | null = null;

    for (let t = start.getTime(); t <= end; t += stepMs) {
      const date = new Date(t);
      const pv = sat.propagate(satrec, date);
      if (!pv.position) continue;
      const gmst = sat.gstime(date);
      const positionEcf = sat.eciToEcf(pv.position, gmst);
      const look = sat.ecfToLookAngles(observerGd, positionEcf);
      const elDeg = sat.radiansToDegrees(look.elevation);

      if (elDeg > 10) {
        if (!inPass) {
          inPass = true;
          passStart = date;
          maxEl = elDeg;
          maxTime = date;
        } else if (elDeg > maxEl) {
          maxEl = elDeg;
          maxTime = date;
        }
      } else if (inPass && passStart && maxTime) {
        passes.push({
          id: `iss-${passStart.toISOString()}`,
          startTime: passStart.toISOString(),
          maxTime: maxTime.toISOString(),
          endTime: date.toISOString(),
          maxElevationDeg: Math.round(maxEl * 10) / 10,
          note: "Predicted from CelesTrak TLE via SGP4. Timing uncertainty applies.",
          source: "CelesTrak TLE + satellite.js",
          provenance: "calculated",
        });
        inPass = false;
        passStart = null;
        maxEl = -Infinity;
        maxTime = null;
        if (passes.length >= 8) break;
      }
    }

    return {
      passes,
      warning:
        passes.length === 0
          ? `No ISS passes above 10° elevation found in the next ${hoursAhead} hours for this location (or prediction window skipped daylight-only geometry).`
          : undefined,
    };
  } catch {
    return {
      passes: [],
      warning:
        "satellite.js is not available in this environment. ISS TLE was fetched, but pass geometry could not be computed. Install satellite.js to enable predictions.",
    };
  }
}
