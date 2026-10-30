"use client";

import { useEffect, useState } from "react";
import type { GeoPlace } from "@/lib/weather/types";

type LocationSearchProps = {
  onSelect: (place: GeoPlace) => void;
};

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Geocoding failed");
        setResults(data.results ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Geocoding failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => window.clearTimeout(handle);
  }, [query]);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
    }
  }

  function applyManual() {
    const latitude = Number(manualLat);
    const longitude = Number(manualLon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("Enter valid numeric latitude and longitude.");
      return;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setError("Latitude must be -90…90 and longitude -180…180.");
      return;
    }
    setError(null);
    onSelect({
      id: Date.now(),
      name: `Manual (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
      latitude,
      longitude,
    });
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onSelect({
          id: Date.now(),
          name: "Current location",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        setLoading(false);
        setError(
          "Location permission denied or unavailable. Search a city or enter coordinates.",
        );
      },
      { timeout: 10000 },
    );
  }

  return (
    <div className="ink-panel space-y-4 rounded-md p-4">
      <div>
        <label className="text-xs uppercase tracking-[0.24em] text-[var(--gold)]">
          Search place
        </label>
        <input
          value={query}
          onChange={handleQueryChange}
          placeholder="City or place name"
          className="mt-2 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.6)] px-3 py-2 text-sm text-[var(--moonlight)] outline-none focus:border-[var(--gold)]"
        />
        {loading ? (
          <p className="mt-2 text-xs text-[var(--mist)]">Searching…</p>
        ) : null}
        {error ? (
          <p className="mt-2 text-xs text-[var(--crimson-bright)]">{error}</p>
        ) : null}
        {results.length > 0 ? (
          <ul className="mt-2 max-h-48 overflow-auto rounded-sm border border-[var(--border)]">
            {results.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-[var(--moonlight)] hover:bg-[rgba(196,163,90,0.08)]"
                  onClick={() => onSelect(place)}
                >
                  {place.name}
                  {place.admin1 ? `, ${place.admin1}` : ""}
                  {place.country ? `, ${place.country}` : ""}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-[var(--mist)]">Latitude</label>
          <input
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.6)] px-3 py-2 text-sm"
            placeholder="e.g. 28.6139"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--mist)]">Longitude</label>
          <input
            value={manualLon}
            onChange={(e) => setManualLon(e.target.value)}
            className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.6)] px-3 py-2 text-sm"
            placeholder="e.g. 77.2090"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={applyManual}
          className="rounded-sm border border-[var(--border-strong)] px-3 py-1.5 text-sm text-[var(--gold-soft)] hover:bg-[rgba(196,163,90,0.08)]"
        >
          Use coordinates
        </button>
        <button
          type="button"
          onClick={useDeviceLocation}
          className="rounded-sm border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--mist)] hover:text-[var(--moonlight)]"
        >
          Use my location (optional)
        </button>
      </div>
      <p className="text-[11px] text-[var(--mist)]">
        Location permission is never required. Manual search always works.
      </p>
    </div>
  );
}
