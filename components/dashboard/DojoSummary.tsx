"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { MoonPhaseDisplay } from "@/components/ui/MoonPhaseDisplay";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { CelestialGlowCard } from "@/components/ui/CelestialGlowCard";
import { calculateNightHonorScore } from "@/lib/scoring/night-honor";
import type { MoonPhaseInfo } from "@/lib/moon/phase";
import type { WeatherForecast } from "@/lib/weather/types";

export function DojoSummary() {
  const [moon, setMoon] = useState<MoonPhaseInfo | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [nearest, setNearest] = useState<WeatherForecast["hourly"][0] | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [weatherRes, eventsRes] = await Promise.all([
          fetch("/api/weather?lat=28.6139&lon=77.209"),
          fetch("/api/events?lat=28.6139&lon=77.209"),
        ]);
        const weather = (await weatherRes.json()) as WeatherForecast & { error?: string };
        const events = await eventsRes.json();
        if (cancelled) return;
        if (weatherRes.ok) {
          setForecast(weather);
          if (weather.hourly?.length) {
            const now = Date.now();
            const best = weather.hourly.reduce((acc, p) => {
              const d = Math.abs(new Date(p.time).getTime() - now);
              const bd = Math.abs(new Date(acc.time).getTime() - now);
              return d < bd ? p : acc;
            }, weather.hourly[0]);
            setNearest(best);
          }
        } else {
          setError(weather.error || "Weather summary unavailable");
        }
        if (eventsRes.ok) {
          setMoon(events.moon ?? null);
          setEventCount((events.events ?? []).length);
        }
      } catch {
        if (!cancelled) setError("Could not load dashboard summary.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const score = calculateNightHonorScore({
    cloudCover: nearest?.cloudCover,
    humidity: nearest?.humidity,
    visibilityMeters: nearest?.visibilityMeters,
    moonIllumination: moon?.illumination,
  });

  if (loading) return <LoadingState label="Gathering Dojo summary…" />;

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <CelestialGlowCard glowColor="gold" className="h-full">
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)]">
              Sample sky check · New Delhi region
            </h2>
            <span className="text-xs text-[var(--gold)]">✦ Live Probe</span>
          </div>
          <p className="text-xs text-[var(--mist)]">
            Default summary location for the dashboard. Open Watchtower to choose
            your own site.
          </p>
          {error ? (
            <p className="text-sm text-[var(--crimson-bright)]">{error}</p>
          ) : null}
          {nearest ? (
            <p className="text-sm text-[var(--moonlight)]">
              Forecast hour {nearest.time}: cloud{" "}
              {nearest.cloudCover ?? "—"}%, RH {nearest.humidity ?? "—"}%
              {nearest.visibilityMeters != null
                ? `, visibility ${(nearest.visibilityMeters / 1000).toFixed(1)} km`
                : ", visibility unavailable"}
            </p>
          ) : null}
          <ScoreGauge score={score.score} label={score.label} size="sm" />
          {forecast?.attribution ? (
            <p className="text-[11px] text-[var(--mist)]">{forecast.attribution}</p>
          ) : null}
          <Link href="/watchtower" className="inline-block text-xs uppercase tracking-wider text-[var(--crimson-bright)] hover:underline pt-1">
            Open Watchtower Map & Forecast →
          </Link>
        </div>
      </CelestialGlowCard>

      <div className="space-y-4">
        {moon ? <MoonPhaseDisplay moon={moon} /> : null}
        <CelestialGlowCard glowColor="cyan">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--mist)] uppercase tracking-wider">Upcoming / Listed Space Events</p>
              <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--moonlight)] mt-1">
                {eventCount ?? "—"} <span className="text-sm text-[var(--gold-soft)] font-sans">events active</span>
              </p>
              <Link
                href="/celestial-scroll"
                className="mt-2 inline-block text-xs uppercase tracking-wider text-[var(--crimson-bright)] hover:underline"
              >
                Open Celestial Scroll →
              </Link>
            </div>
            <span className="text-3xl opacity-80">📜</span>
          </div>
        </CelestialGlowCard>
      </div>
    </section>
  );
}
