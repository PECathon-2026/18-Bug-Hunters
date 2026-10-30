import * as Astronomy from "astronomy-engine";

export type MoonPhaseInfo = {
  date: string;
  phaseAngleDeg: number;
  illumination: number;
  phaseName: string;
  explanation: string;
  source: "astronomy-engine";
  provenance: "calculated";
};

function phaseNameFromAngle(phaseAngleDeg: number): string {
  // phaseAngle: 0 = new, 180 = full (astronomy-engine MoonPhase)
  const a = ((phaseAngleDeg % 360) + 360) % 360;
  if (a < 22.5 || a >= 337.5) return "New Moon";
  if (a < 67.5) return "Waxing Crescent";
  if (a < 112.5) return "First Quarter";
  if (a < 157.5) return "Waxing Gibbous";
  if (a < 202.5) return "Full Moon";
  if (a < 247.5) return "Waning Gibbous";
  if (a < 292.5) return "Last Quarter";
  return "Waning Crescent";
}

export function getMoonPhaseInfo(date = new Date()): MoonPhaseInfo {
  const time = Astronomy.MakeTime(date);
  const phaseAngleDeg = Astronomy.MoonPhase(time);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, time).phase_fraction;
  const phaseName = phaseNameFromAngle(phaseAngleDeg);

  return {
    date: date.toISOString(),
    phaseAngleDeg,
    illumination,
    phaseName,
    explanation: `${phaseName}: approximately ${(illumination * 100).toFixed(0)}% of the Moon's disk is illuminated (calculated, not observed).`,
    source: "astronomy-engine",
    provenance: "calculated",
  };
}
