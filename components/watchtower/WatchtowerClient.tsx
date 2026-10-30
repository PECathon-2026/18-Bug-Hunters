"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { LocationSearch } from "@/components/watchtower/LocationSearch";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { calculateNightHonorScore } from "@/lib/scoring/night-honor";
import { getMoonPhaseInfo } from "@/lib/moon/phase";
import type { GeoPlace, WeatherForecast } from "@/lib/weather/types";
import type { MapSite } from "@/components/watchtower/WatchtowerMap";

const WatchtowerMap = dynamic(
  () =>
    import("@/components/watchtower/WatchtowerMap").then((m) => m.WatchtowerMap),
  {
    ssr: false,
    loading: () => <LoadingState label="Loading map…" />,
  },
);

type SitePayload = MapSite & {
  lightPollution: number | null;
  notes: string;
  source: string;
};

function nearestHour(forecast: WeatherForecast) {
  const now = Date.now();
  return forecast.hourly.reduce((best, point) => {
    if (!best) return point;
    const d = Math.abs(new Date(point.time).getTime() - now);
    const bd = Math.abs(new Date(best.time).getTime() - now);
    return d < bd ? point : best;
  }, forecast.hourly[0] ?? null);
}

export function WatchtowerClient() {
  const [place, setPlace] = useState<GeoPlace | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [sites, setSites] = useState<SitePayload[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [moon] = useState(() => getMoonPhaseInfo(new Date()));

  const loadForPlace = useCallback(async (selected: GeoPlace) => {
    setPlace(selected);
    setLoading(true);
    setError(null);
    setForecast(null);
    setSites([]);
    setSelectedSiteId(null);
    try {
      const [weatherRes, sitesRes] = await Promise.all([
        fetch(
          `/api/weather?lat=${selected.latitude}&lon=${selected.longitude}`,
        ),
        fetch(`/api/sites?lat=${selected.latitude}&lon=${selected.longitude}`),
      ]);
      const weatherData = await weatherRes.json();
      const sitesData = await sitesRes.json();
      if (!weatherRes.ok) {
        throw new Error(weatherData.error || "Weather request failed");
      }
      setForecast(weatherData as WeatherForecast);

      const siteList = (sitesData.sites ?? []) as SitePayload[];
      const enriched = await Promise.all(
        siteList.map(async (site) => {
          try {
            const res = await fetch(
              `/api/weather?lat=${site.latitude}&lon=${site.longitude}`,
            );
            if (!res.ok) return { ...site, score: null, scoreLabel: "unavailable" };
            const f = (await res.json()) as WeatherForecast;
            const hour = nearestHour(f);
            const result = calculateNightHonorScore({
              cloudCover: hour?.cloudCover,
              humidity: hour?.humidity,
              visibilityMeters: hour?.visibilityMeters,
              moonIllumination: moon.illumination,
              lightPollution: site.lightPollution,
            });
            return {
              ...site,
              score: result.score,
              scoreLabel: result.label,
            };
          } catch {
            return { ...site, score: null, scoreLabel: "unavailable" };
          }
        }),
      );
      setSites(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Watchtower data");
    } finally {
      setLoading(false);
    }
  }, [moon.illumination]);

  const hour = forecast ? nearestHour(forecast) : null;
  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? null;

  const scoreInputs = {
    cloudCover: hour?.cloudCover,
    humidity: hour?.humidity,
    visibilityMeters: hour?.visibilityMeters,
    moonIllumination: moon.illumination,
    lightPollution: selectedSite?.lightPollution ?? null,
  };
  const score = calculateNightHonorScore(scoreInputs);

  const windows =
    forecast?.hourly
      .filter((h) => {
        const hr = new Date(h.time).getHours();
        const night = hr >= 18 || hr <= 5;
        return night && h.cloudCover !== null && h.cloudCover <= 40;
      })
      .slice(0, 8) ?? [];

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 3),
    );
  }

  return (
    <div className="space-y-6">
      <LocationSearch onSelect={loadForPlace} />

      {loading ? <LoadingState label="Fetching forecast and curated sites…" /> : null}
      {error ? (
        <ErrorState
          message={error}
          onRetry={() => place && loadForPlace(place)}
        />
      ) : null}

      {place && forecast && hour ? (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="ink-panel space-y-3 rounded-md p-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)]">
                {place.name}
              </h2>
              <p className="text-sm text-[var(--mist)]">
                {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)} · timezone{" "}
                {forecast.timezone}
              </p>
              <p className="text-sm text-[var(--moonlight)]">
                Forecast hour:{" "}
                <span className="text-[var(--gold)]">{hour.time}</span> (model
                local time from Open-Meteo)
              </p>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-[var(--mist)]">Cloud cover</dt>
                  <dd>
                    {hour.cloudCover == null ? "—" : `${hour.cloudCover}%`}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--mist)]">Humidity</dt>
                  <dd>{hour.humidity == null ? "—" : `${hour.humidity}%`}</dd>
                </div>
                <div>
                  <dt className="text-[var(--mist)]">Visibility</dt>
                  <dd>
                    {hour.visibilityMeters == null
                      ? "unavailable"
                      : `${(hour.visibilityMeters / 1000).toFixed(1)} km`}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--mist)]">Temp</dt>
                  <dd>
                    {hour.temperatureC == null
                      ? "—"
                      : `${hour.temperatureC.toFixed(1)}°C`}
                  </dd>
                </div>
              </dl>
              <p className="text-[11px] text-[var(--mist)]">
                {forecast.attribution}. Values are forecast model output, not
                guarantees.
              </p>
            </div>

            <div className="ink-panel space-y-4 rounded-md p-4">
              <ScoreGauge score={score.score} label={score.label} />
              <p className="text-sm text-[var(--mist)]">{score.explanation}</p>
              <ul className="space-y-2 text-xs text-[var(--mist)]">
                {score.factors.map((f) => (
                  <li key={f.key} className="border-t border-[var(--border)] pt-2">
                    <span className="text-[var(--moonlight)]">{f.label}</span>: {f.note}
                    {f.contribution != null
                      ? ` · contributes ${f.contribution.toFixed(1)}`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--moonlight)]">
              Curated observing sites
            </h2>
            <p className="text-sm text-[var(--mist)]">
              Markers are curated real locations with approximate light-pollution
              estimates. Weather alone does not prove a site is dark enough.
            </p>
            <WatchtowerMap
              center={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              sites={sites}
              selectedId={selectedSiteId}
              onSelect={setSelectedSiteId}
            />
            <div className="grid gap-3 md:grid-cols-2">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className={`ink-panel rounded-md p-4 ${
                    selectedSiteId === site.id ? "border-[var(--gold)]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--gold-soft)]">
                        {site.name}
                      </h3>
                      <p className="text-xs text-[var(--mist)]">
                        {site.distanceKm?.toFixed(0)} km · curated
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-[var(--gold)]"
                      onClick={() => setSelectedSiteId(site.id)}
                    >
                      Focus
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-[var(--mist)]">{site.notes}</p>
                  <p className="mt-2 text-sm">
                    Night Honor:{" "}
                    {site.score == null ? "—" : `${site.score} (${site.scoreLabel})`}
                  </p>
                  <p className="text-[11px] text-[var(--mist)]">Source: {site.source}</p>
                  <button
                    type="button"
                    onClick={() => toggleCompare(site.id)}
                    className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--crimson-bright)]"
                  >
                    {compareIds.includes(site.id) ? "Remove compare" : "Compare"}
                  </button>
                </div>
              ))}
            </div>
            {compareIds.length > 0 ? (
              <div className="ink-panel rounded-md p-4">
                <h3 className="font-[family-name:var(--font-display)] text-lg">
                  Comparison
                </h3>
                <p className="mb-2 text-xs text-[var(--mist)]">
                  Comparison uses available scores only — not a claim of the single
                  best observing site.
                </p>
                <ul className="space-y-1 text-sm">
                  {compareIds.map((id) => {
                    const s = sites.find((x) => x.id === id);
                    if (!s) return null;
                    return (
                      <li key={id}>
                        {s.name}: {s.score ?? "—"} ({s.scoreLabel ?? "n/a"})
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="ink-panel rounded-md p-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              Potential observing windows
            </h2>
            <p className="mt-1 text-sm text-[var(--mist)]">
              Night-ish hours with forecast cloud cover ≤ 40%. Weather can change;
              this is not a guarantee.
            </p>
            {windows.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--mist)]">
                No low-cloud night hours found in the retrieved forecast window.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {windows.map((w) => (
                  <li
                    key={w.time}
                    className="rounded-sm border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    {w.time} · cloud {w.cloudCover}%
                    {w.humidity != null ? ` · RH ${w.humidity}%` : ""}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      {!place && !loading ? (
        <p className="text-sm text-[var(--mist)]">
          Choose a location to load live Open-Meteo forecast data.
        </p>
      ) : null}
    </div>
  );
}
