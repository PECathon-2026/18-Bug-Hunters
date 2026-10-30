/**
 * Night Honor Score — project-defined stargazing suitability metric (0–100).
 * Not an official scientific measurement.
 *
 * Weights (when all factors present):
 * - cloudCover: 45%
 * - visibility: 25%
 * - humidity: 15%
 * - moonIllumination: 10%
 * - lightPollution: 5% (only when provided; otherwise redistributed)
 *
 * Missing data: factor is excluded and remaining weights are renormalized.
 * Unknown values are NEVER treated as perfect conditions.
 */

export type ScoreLabel = "favorable" | "moderate" | "poor";

export type NightHonorInputs = {
  /** Total cloud cover percent 0–100 */
  cloudCover?: number | null;
  /** Visibility in meters */
  visibilityMeters?: number | null;
  /** Relative humidity percent 0–100 */
  humidity?: number | null;
  /** Moon illumination fraction 0–1 */
  moonIllumination?: number | null;
  /**
   * Light pollution penalty 0–1 where 0 = darkest skies, 1 = severe pollution.
   * Only use when a trustworthy source provides it.
   */
  lightPollution?: number | null;
};

export type FactorContribution = {
  key: keyof NightHonorInputs;
  label: string;
  raw: number | null;
  normalized: number | null;
  weight: number;
  contribution: number | null;
  note: string;
};

export type NightHonorResult = {
  score: number | null;
  label: ScoreLabel | "unavailable";
  factors: FactorContribution[];
  explanation: string;
};

const BASE_WEIGHTS: Record<keyof NightHonorInputs, number> = {
  cloudCover: 0.45,
  visibilityMeters: 0.25,
  humidity: 0.15,
  moonIllumination: 0.1,
  lightPollution: 0.05,
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function isPresent(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Lower cloud cover is better. */
export function normalizeCloudCover(cloudCover: number): number {
  return clamp01(1 - cloudCover / 100);
}

/**
 * Visibility: treat >= 20 km as excellent, <= 2 km as poor.
 * Open-Meteo returns meters.
 */
export function normalizeVisibility(meters: number): number {
  const km = meters / 1000;
  if (km >= 20) return 1;
  if (km <= 2) return 0;
  return clamp01((km - 2) / 18);
}

/** Lower humidity is generally better for transparency. */
export function normalizeHumidity(humidity: number): number {
  return clamp01(1 - humidity / 100);
}

/** Less moon illumination is better for deep-sky; bright moon hurts. */
export function normalizeMoon(illumination: number): number {
  return clamp01(1 - illumination);
}

/** lightPollution already 0 (dark) … 1 (bright); invert for score. */
export function normalizeLightPollution(pollution: number): number {
  return clamp01(1 - pollution);
}

export function scoreLabel(score: number): ScoreLabel {
  if (score >= 70) return "favorable";
  if (score >= 40) return "moderate";
  return "poor";
}

export function calculateNightHonorScore(
  inputs: NightHonorInputs,
): NightHonorResult {
  const factorDefs: Array<{
    key: keyof NightHonorInputs;
    label: string;
    raw: number | null | undefined;
    normalize: (v: number) => number;
    formatNote: (v: number, n: number) => string;
  }> = [
    {
      key: "cloudCover",
      label: "Cloud cover",
      raw: inputs.cloudCover,
      normalize: normalizeCloudCover,
      formatNote: (v, n) =>
        `${v.toFixed(0)}% cloud → factor ${n.toFixed(2)} (clearer is better)`,
    },
    {
      key: "visibilityMeters",
      label: "Visibility",
      raw: inputs.visibilityMeters,
      normalize: normalizeVisibility,
      formatNote: (v, n) =>
        `${(v / 1000).toFixed(1)} km → factor ${n.toFixed(2)}`,
    },
    {
      key: "humidity",
      label: "Humidity",
      raw: inputs.humidity,
      normalize: normalizeHumidity,
      formatNote: (v, n) =>
        `${v.toFixed(0)}% RH → factor ${n.toFixed(2)} (drier is better)`,
    },
    {
      key: "moonIllumination",
      label: "Moon illumination",
      raw: inputs.moonIllumination,
      normalize: normalizeMoon,
      formatNote: (v, n) =>
        `${(v * 100).toFixed(0)}% lit → factor ${n.toFixed(2)}`,
    },
    {
      key: "lightPollution",
      label: "Light pollution",
      raw: inputs.lightPollution,
      normalize: normalizeLightPollution,
      formatNote: (v, n) =>
        `pollution index ${v.toFixed(2)} → factor ${n.toFixed(2)}`,
    },
  ];

  const available = factorDefs.filter((f) => isPresent(f.raw));
  if (available.length === 0) {
    return {
      score: null,
      label: "unavailable",
      factors: factorDefs.map((f) => ({
        key: f.key,
        label: f.label,
        raw: null,
        normalized: null,
        weight: 0,
        contribution: null,
        note: "No data available for this factor",
      })),
      explanation:
        "Night Honor Score unavailable — no usable weather or sky factors were provided.",
    };
  }

  const weightSum = available.reduce(
    (sum, f) => sum + BASE_WEIGHTS[f.key],
    0,
  );

  const factors: FactorContribution[] = factorDefs.map((f) => {
    if (!isPresent(f.raw)) {
      return {
        key: f.key,
        label: f.label,
        raw: null,
        normalized: null,
        weight: 0,
        contribution: null,
        note: "Excluded — missing data (not assumed perfect)",
      };
    }
    const normalized = f.normalize(f.raw);
    const weight = BASE_WEIGHTS[f.key] / weightSum;
    const contribution = normalized * weight * 100;
    return {
      key: f.key,
      label: f.label,
      raw: f.raw,
      normalized,
      weight,
      contribution,
      note: f.formatNote(f.raw, normalized),
    };
  });

  const score = Math.round(
    factors.reduce((sum, f) => sum + (f.contribution ?? 0), 0) * 10,
  ) / 10;

  const clamped = Math.min(100, Math.max(0, score));
  const label = scoreLabel(clamped);
  const used = factors.filter((f) => f.contribution !== null);
  const explanation = `Score ${clamped} (${label}) from ${used.length} factor(s): ${used
    .map((f) => `${f.label} ${f.contribution!.toFixed(1)}`)
    .join(", ")}. Missing factors were excluded, not treated as ideal.`;

  return { score: clamped, label, factors, explanation };
}
