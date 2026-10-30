import { describe, expect, it } from "vitest";
import { filterEvents } from "../lib/events/filter";
import type { CelestialEvent } from "../lib/events/types";

const sample: CelestialEvent[] = [
  {
    id: "a",
    type: "meteor_shower",
    title: "Perseids",
    description: "August meteors",
    startTime: "2026-08-12T00:00:00.000Z",
    source: "curated",
    dataProvenance: "curated",
  },
  {
    id: "b",
    type: "rocket_launch",
    title: "Example Launch",
    description: "Orbital attempt",
    startTime: "2026-03-01T12:00:00.000Z",
    source: "LL2",
    dataProvenance: "live",
  },
];

describe("filterEvents", () => {
  it("filters by type", () => {
    const result = filterEvents(sample, { types: ["meteor_shower"] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a");
  });

  it("filters by query", () => {
    const result = filterEvents(sample, { query: "launch" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("b");
  });

  it("sorts chronologically", () => {
    const result = filterEvents(sample, {});
    expect(result[0].id).toBe("b");
    expect(result[1].id).toBe("a");
  });
});
