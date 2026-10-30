import type { CelestialEvent } from "@/lib/events/types";

/**
 * Curated meteor showers and eclipses for demo/fallback.
 * Dates are approximate peak windows for 2026 based on publicly documented calendars.
 * Always labelled dataProvenance: "curated".
 */
export function getCuratedEvents(year = 2026): CelestialEvent[] {
  return [
    {
      id: "quadrantids-2026",
      type: "meteor_shower",
      title: "Quadrantids peak",
      description:
        "Early-January meteor shower. Peak rates vary; cold weather and moonlight affect visibility.",
      startTime: `${year}-01-03T00:00:00.000Z`,
      endTime: `${year}-01-04T12:00:00.000Z`,
      source: "Curated meteor calendar (IMO-style peak window)",
      sourceUrl: "https://www.imo.net/",
      visibilityGuidance: "Best after midnight from dark sites in the Northern Hemisphere.",
      dataProvenance: "curated",
    },
    {
      id: "lyrids-2026",
      type: "meteor_shower",
      title: "Lyrids peak",
      description: "April meteor shower associated with Comet Thatcher.",
      startTime: `${year}-04-22T00:00:00.000Z`,
      endTime: `${year}-04-23T12:00:00.000Z`,
      source: "Curated meteor calendar",
      sourceUrl: "https://www.imo.net/",
      dataProvenance: "curated",
    },
    {
      id: "perseids-2026",
      type: "meteor_shower",
      title: "Perseids peak",
      description: "Popular August meteor shower from Comet Swift–Tuttle debris.",
      startTime: `${year}-08-12T00:00:00.000Z`,
      endTime: `${year}-08-13T12:00:00.000Z`,
      source: "Curated meteor calendar",
      sourceUrl: "https://www.imo.net/",
      visibilityGuidance: "Northern Hemisphere favored; avoid city lights.",
      dataProvenance: "curated",
    },
    {
      id: "geminids-2026",
      type: "meteor_shower",
      title: "Geminids peak",
      description: "Reliable December meteor shower; often among the strongest annual showers.",
      startTime: `${year}-12-13T00:00:00.000Z`,
      endTime: `${year}-12-14T12:00:00.000Z`,
      source: "Curated meteor calendar",
      sourceUrl: "https://www.imo.net/",
      dataProvenance: "curated",
    },
    {
      id: "total-solar-eclipse-2026",
      type: "eclipse",
      title: "Total solar eclipse (12 Aug 2026)",
      description:
        "Total solar eclipse with a path across parts of the Arctic, Greenland, Iceland, and Spain. Outside the path, only a partial eclipse is visible.",
      startTime: `${year}-08-12T16:00:00.000Z`,
      endTime: `${year}-08-12T21:00:00.000Z`,
      source: "Curated eclipse entry (verify with NASA eclipse pages for path details)",
      sourceUrl: "https://eclipse.gsfc.nasa.gov/",
      locationConstraint: "Totality path is geographically limited",
      visibilityGuidance: "Never look at the Sun without proper solar filters.",
      dataProvenance: "curated",
    },
    {
      id: "annular-solar-eclipse-2026",
      type: "eclipse",
      title: "Annular solar eclipse (17 Feb 2026)",
      description:
        "Annular solar eclipse. Visibility of the ring depends on being inside the antumbral path.",
      startTime: `${year}-02-17T08:00:00.000Z`,
      endTime: `${year}-02-17T14:00:00.000Z`,
      source: "Curated eclipse entry",
      sourceUrl: "https://eclipse.gsfc.nasa.gov/",
      dataProvenance: "curated",
    },
  ];
}
