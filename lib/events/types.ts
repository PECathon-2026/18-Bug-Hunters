export type CelestialEventType =
  | "meteor_shower"
  | "eclipse"
  | "moon_phase"
  | "iss_pass"
  | "rocket_launch";

export type DataProvenance = "live" | "calculated" | "curated";

export type CelestialEvent = {
  id: string;
  type: CelestialEventType;
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  timeZone?: string;
  source: string;
  sourceUrl?: string;
  visibilityGuidance?: string;
  locationConstraint?: string;
  dataProvenance: DataProvenance;
  metadata?: Record<string, string | number | boolean | null>;
};
