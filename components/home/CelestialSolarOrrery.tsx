"use client";

import { useState } from "react";
import { getMoonPhaseInfo } from "@/lib/moon/phase";

type Planet = {
  name: string;
  kanji: string;
  color: string;
  orbitRadius: number;
  size: number;
  speed: number;
  notes: string;
};

const PLANETS: Planet[] = [
  {
    name: "Mercury",
    kanji: "水星",
    color: "#a8b5c4",
    orbitRadius: 48,
    size: 5,
    speed: 4.1,
    notes: "Closest to the Sun · 88-day orbit",
  },
  {
    name: "Venus",
    kanji: "金星",
    color: "#e8c878",
    orbitRadius: 75,
    size: 8,
    speed: 1.6,
    notes: "The Morning & Evening Star · Thick reflective atmosphere",
  },
  {
    name: "Earth",
    kanji: "地球",
    color: "#4da8da",
    orbitRadius: 110,
    size: 9,
    speed: 1.0,
    notes: "Home of the Samurai Watchtower · 365.25-day orbit",
  },
  {
    name: "Mars",
    kanji: "火星",
    color: "#c4454d",
    orbitRadius: 150,
    size: 7,
    speed: 0.53,
    notes: "The Red Planet · Target for opposition stargazing",
  },
];

// Stable anchor for static prerendering
const PRERENDER_DATE = new Date("2026-03-21T00:00:00Z");

export function CelestialSolarOrrery() {
  const [viewMode, setViewMode] = useState<"earth" | "solar">("earth");
  const [isWarp, setIsWarp] = useState(false);
  const [selectedBody, setSelectedBody] = useState<string>("Earth (地球)");
  const [selectedNote, setSelectedNote] = useState<string>(
    "Rotating Earth with atmospheric glow, orbiting Moon, and ISS pass track.",
  );
  const [moonInfo] = useState(() => getMoonPhaseInfo(PRERENDER_DATE));

  const speedMultiplier = isWarp ? 4 : 1;

  return (
    <div className="relative overflow-hidden rounded-md border border-[var(--border-strong)] bg-[radial-gradient(ellipse_at_center,rgba(11,18,32,0.95)_0%,rgba(5,7,13,0.98)_100%)] p-5 shadow-2xl">
      {/* Astrolabe / Celestial Coordinates Background Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(196,163,90,0.15) 1px, transparent 1px),
            linear-gradient(rgba(196,163,90,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(196,163,90,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🪐</span>
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--gold-soft)] sm:text-xl">
              Celestial Motion Orrery · 天球儀
            </h3>
            <p className="text-[11px] text-[var(--mist)]">
              Interactive orbital projection of moving planetary spheres & lunar phases.
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 text-xs">
          <div className="rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.8)] p-0.5 flex">
            <button
              type="button"
              onClick={() => {
                setViewMode("earth");
                setSelectedBody("Earth (地球)");
                setSelectedNote("Rotating Earth with atmospheric glow & orbiting Moon.");
              }}
              className={`rounded-xs px-2.5 py-1 transition ${
                viewMode === "earth"
                  ? "bg-[var(--gold)] text-[var(--void)] font-medium"
                  : "text-[var(--mist)] hover:text-[var(--moonlight)]"
              }`}
            >
              Earth & Moon
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("solar");
                setSelectedBody("Sun (太陽)");
                setSelectedNote("Inner Solar System orrery with terrestrial orbital tracks.");
              }}
              className={`rounded-xs px-2.5 py-1 transition ${
                viewMode === "solar"
                  ? "bg-[var(--gold)] text-[var(--void)] font-medium"
                  : "text-[var(--mist)] hover:text-[var(--moonlight)]"
              }`}
            >
              Solar System
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsWarp((prev) => !prev)}
            className={`rounded-sm border px-2 py-1 transition ${
              isWarp
                ? "border-[var(--crimson-bright)] bg-[rgba(196,69,77,0.2)] text-[var(--crimson-bright)] font-semibold"
                : "border-[var(--border)] text-[var(--mist)] hover:text-[var(--gold-soft)]"
            }`}
          >
            {isWarp ? "⚡ Warp 4x" : "⏱️ 1x Speed"}
          </button>
        </div>
      </div>

      {/* Main Celestial Orrery Animation Canvas */}
      <div className="relative my-4 flex h-[340px] w-full items-center justify-center overflow-hidden sm:h-[380px]">
        {/* Japanese Cardinal Direction Compass Markers */}
        <span className="pointer-events-none absolute top-2 text-[10px] tracking-widest text-[var(--gold)] opacity-40 font-serif">
          北 · NORTH
        </span>
        <span className="pointer-events-none absolute bottom-2 text-[10px] tracking-widest text-[var(--gold)] opacity-40 font-serif">
          南 · SOUTH
        </span>
        <span className="pointer-events-none absolute right-2 text-[10px] tracking-widest text-[var(--gold)] opacity-40 font-serif">
          東 · EAST
        </span>
        <span className="pointer-events-none absolute left-2 text-[10px] tracking-widest text-[var(--gold)] opacity-40 font-serif">
          西 · WEST
        </span>

        {/* MODE A: EARTH & MOON SYSTEM */}
        {viewMode === "earth" && (
          <div className="relative flex items-center justify-center">
            {/* Outer Lunar Orbit Ring */}
            <div
              className="absolute rounded-full border border-dashed border-[rgba(196,163,90,0.35)]"
              style={{ width: "260px", height: "260px" }}
            />

            {/* Inner ISS Satellite Orbit Track */}
            <div
              className="absolute rounded-full border border-[rgba(100,200,255,0.25)]"
              style={{
                width: "160px",
                height: "160px",
                transform: "rotate(45deg)",
              }}
            />

            {/* Orbiting Moon container */}
            <div
              className="absolute"
              style={{
                width: "260px",
                height: "260px",
                animation: `spin-orbit ${28 / speedMultiplier}s linear infinite`,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedBody(`Moon · ${moonInfo.phaseName} (月)`);
                  setSelectedNote(
                    `Illumination: ${(moonInfo.illumination * 100).toFixed(0)}% · Phase Angle: ${moonInfo.phaseAngleDeg.toFixed(1)}° (Calculated via astronomy-engine)`,
                  );
                }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 group cursor-pointer"
                title="The Moon"
              >
                <div className="h-6 w-6 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffffff,#cfd8dc_50%,#546e7a_100%)] shadow-[0_0_12px_rgba(255,255,255,0.7)] border border-[rgba(255,255,255,0.8)] transition group-hover:scale-125" />
                <span className="rounded-xs bg-black/70 px-1 py-0.5 text-[9px] text-[var(--gold-soft)] border border-[var(--border)] whitespace-nowrap">
                  月 Moon
                </span>
              </button>
            </div>

            {/* Orbiting ISS Satellite */}
            <div
              className="absolute"
              style={{
                width: "160px",
                height: "160px",
                animation: `spin-orbit-reverse ${8 / speedMultiplier}s linear infinite`,
                transform: "rotate(45deg)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedBody("ISS (国際宇宙ステーション)");
                  setSelectedNote(
                    "Low Earth Orbit altitude ~420 km · Orbital speed ~27,600 km/h · 92-minute period.",
                  );
                }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 group cursor-pointer"
                title="International Space Station"
              >
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[var(--gold)] text-[7px] text-[var(--void)] font-bold shadow-[0_0_8px_#c4a35a]">
                  🛰️
                </span>
              </button>
            </div>

            {/* Central Rotating Earth Globe */}
            <button
              type="button"
              onClick={() => {
                setSelectedBody("Earth · Mother Planet (地球)");
                setSelectedNote(
                  "Equatorial diameter 12,742 km · Atmosphere thickness ~100 km · 23.4° axial tilt.",
                );
              }}
              className="relative flex items-center justify-center rounded-full p-2 group cursor-pointer"
              title="Earth"
            >
              {/* Outer Atmosphere Glow */}
              <div className="absolute h-36 w-36 rounded-full bg-[radial-gradient(circle,#4da8da_0%,rgba(100,200,255,0.25)_50%,transparent_75%)] animate-pulse-soft" />

              {/* Atmospheric Blue Halo Ring */}
              <div className="absolute h-28 w-28 rounded-full border-2 border-[#70c0ff] shadow-[0_0_24px_rgba(77,168,218,0.8)]" />

              {/* Rotating Earth Sphere with Continents & Clouds */}
              <div
                className="relative h-24 w-24 overflow-hidden rounded-full shadow-[inset_-12px_-8px_18px_rgba(0,0,0,0.9),0_0_20px_rgba(77,168,218,0.5)]"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, #5dbcd2 0%, #1e5f8a 40%, #0d2b45 75%, #05101a 100%)",
                }}
              >
                {/* Landmass & Cloud Layer Rotating Across Earth */}
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 30%, rgba(68,140,93,0.9) 16px, transparent 18px),
                      radial-gradient(circle at 60% 45%, rgba(68,140,93,0.8) 22px, transparent 25px),
                      radial-gradient(circle at 75% 70%, rgba(68,140,93,0.7) 14px, transparent 16px),
                      radial-gradient(circle at 35% 75%, rgba(68,140,93,0.8) 18px, transparent 20px),
                      radial-gradient(circle at 50% 20%, rgba(255,255,255,0.7) 8px, transparent 12px),
                      radial-gradient(circle at 70% 60%, rgba(255,255,255,0.5) 12px, transparent 18px)
                    `,
                    animation: `earth-rotation ${20 / speedMultiplier}s linear infinite`,
                  }}
                />

                {/* Night-side Shadow Terminator */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[rgba(5,7,13,0.85)]" />
              </div>
            </button>
          </div>
        )}

        {/* MODE B: INNER SOLAR SYSTEM ORRERY */}
        {viewMode === "solar" && (
          <div className="relative flex items-center justify-center">
            {/* Concentric Planetary Orbit Rings */}
            {PLANETS.map((planet) => (
              <div
                key={planet.name}
                className="absolute rounded-full border border-[rgba(196,163,90,0.22)]"
                style={{
                  width: `${planet.orbitRadius * 2}px`,
                  height: `${planet.orbitRadius * 2}px`,
                }}
              />
            ))}

            {/* Central Sun */}
            <button
              type="button"
              onClick={() => {
                setSelectedBody("The Sun · Amaterasu (太陽)");
                setSelectedNote(
                  "Surface temperature 5,500°C · Core fusion powered by hydrogen fusion · Center of solar gravity.",
                );
              }}
              className="relative flex items-center justify-center group cursor-pointer z-10"
              title="The Sun"
            >
              <div className="absolute h-16 w-16 rounded-full bg-[radial-gradient(circle,#ffe680_0%,#ffa726_45%,transparent_70%)] animate-pulse" />
              <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff9c4,#ffd54f_40%,#ff9800_80%,#e65100_100%)] shadow-[0_0_25px_rgba(255,183,77,0.9)] border border-[#ffecb3]" />
            </button>

            {/* Orbiting Planets */}
            {PLANETS.map((planet) => {
              const animDuration = (20 / planet.speed) / speedMultiplier;
              return (
                <div
                  key={planet.name}
                  className="absolute"
                  style={{
                    width: `${planet.orbitRadius * 2}px`,
                    height: `${planet.orbitRadius * 2}px`,
                    animation: `spin-orbit ${animDuration}s linear infinite`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBody(`${planet.name} (${planet.kanji})`);
                      setSelectedNote(planet.notes);
                    }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 group cursor-pointer"
                    title={planet.name}
                  >
                    <div
                      className="rounded-full shadow-lg transition group-hover:scale-150"
                      style={{
                        width: `${planet.size}px`,
                        height: `${planet.size}px`,
                        backgroundColor: planet.color,
                        boxShadow: `0 0 8px ${planet.color}`,
                      }}
                    />
                    <span className="rounded-xs bg-black/75 px-1 py-0.2 text-[8px] text-[var(--gold-soft)] border border-[rgba(196,163,90,0.3)] whitespace-nowrap opacity-75 group-hover:opacity-100">
                      {planet.kanji}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Body Telemetry Footer */}
      <div className="relative z-10 rounded-sm border border-[var(--border)] bg-[rgba(11,18,32,0.85)] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[var(--gold)] font-medium font-serif">
            {selectedBody}:
          </span>{" "}
          <span className="text-[var(--mist)]">{selectedNote}</span>
        </div>
        <span className="text-[10px] text-[var(--gold-soft)] font-mono">
          Click any sphere to inspect
        </span>
      </div>

      <style jsx>{`
        @keyframes spin-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-orbit-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes earth-rotation {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }
      `}</style>
    </div>
  );
}
