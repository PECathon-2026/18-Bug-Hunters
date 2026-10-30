import { describe, expect, it } from "vitest";
import {
  calculateNightHonorScore,
  normalizeCloudCover,
  normalizeHumidity,
  normalizeVisibility,
  scoreLabel,
} from "../lib/scoring/night-honor";

describe("Night Honor Score", () => {
  it("returns unavailable when no factors provided", () => {
    const result = calculateNightHonorScore({});
    expect(result.score).toBeNull();
    expect(result.label).toBe("unavailable");
  });

  it("scores clear dry high-visibility conditions highly", () => {
    const result = calculateNightHonorScore({
      cloudCover: 5,
      humidity: 20,
      visibilityMeters: 25000,
      moonIllumination: 0.05,
      lightPollution: 0.1,
    });
    expect(result.score).not.toBeNull();
    expect(result.score!).toBeGreaterThanOrEqual(70);
    expect(result.label).toBe("favorable");
  });

  it("scores overcast conditions poorly", () => {
    const result = calculateNightHonorScore({
      cloudCover: 95,
      humidity: 90,
      visibilityMeters: 2000,
      moonIllumination: 0.95,
      lightPollution: 0.9,
    });
    expect(result.score).not.toBeNull();
    expect(result.score!).toBeLessThan(40);
    expect(result.label).toBe("poor");
  });

  it("excludes missing factors instead of treating them as perfect", () => {
    const withMissing = calculateNightHonorScore({ cloudCover: 0 });
    const withExplicitBadVis = calculateNightHonorScore({
      cloudCover: 0,
      visibilityMeters: 1000,
    });
    expect(withMissing.score).not.toBeNull();
    expect(withExplicitBadVis.score).not.toBeNull();
    expect(withMissing.score!).toBeGreaterThan(withExplicitBadVis.score!);
    const visFactor = withMissing.factors.find(
      (f) => f.key === "visibilityMeters",
    );
    expect(visFactor?.contribution).toBeNull();
  });

  it("clamps score to 0–100", () => {
    const result = calculateNightHonorScore({
      cloudCover: 0,
      humidity: 0,
      visibilityMeters: 50000,
      moonIllumination: 0,
      lightPollution: 0,
    });
    expect(result.score!).toBeGreaterThanOrEqual(0);
    expect(result.score!).toBeLessThanOrEqual(100);
  });

  it("normalizers behave at boundaries", () => {
    expect(normalizeCloudCover(0)).toBe(1);
    expect(normalizeCloudCover(100)).toBe(0);
    expect(normalizeHumidity(0)).toBe(1);
    expect(normalizeHumidity(100)).toBe(0);
    expect(normalizeVisibility(20000)).toBe(1);
    expect(normalizeVisibility(2000)).toBe(0);
  });

  it("label thresholds", () => {
    expect(scoreLabel(70)).toBe("favorable");
    expect(scoreLabel(40)).toBe("moderate");
    expect(scoreLabel(39.9)).toBe("poor");
  });
});
