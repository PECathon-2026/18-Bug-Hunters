"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Toast } from "@/components/ui/Toast";
import { LunarMiniCalendar } from "@/components/celestial/LunarMiniCalendar";
import type { CelestialEvent, CelestialEventType } from "@/lib/events/types";
import type { MoonPhaseInfo } from "@/lib/moon/phase";

const ALL_TYPES: { type: CelestialEventType; label: string; icon: string }[] = [
  { type: "meteor_shower", label: "Meteor Showers", icon: "☄️" },
  { type: "eclipse", label: "Solar & Lunar Eclipses", icon: "🌑" },
  { type: "rocket_launch", label: "Rocket Launches", icon: "🚀" },
  { type: "iss_pass", label: "ISS Orbital Passes", icon: "🛰️" },
  { type: "moon_phase", label: "Moon Phases", icon: "🌕" },
];

export function CelestialScrollClient() {
  const [rawEvents, setRawEvents] = useState<CelestialEvent[]>([]);
  const [moon, setMoon] = useState<MoonPhaseInfo | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CelestialEvent | null>(null);

  // Fast In-Memory Filter States (no network delay on change!)
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<CelestialEventType[]>(ALL_TYPES.map((t) => t.type));
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [lat, setLat] = useState("28.6139");
  const [lon, setLon] = useState("77.209");
  const [toast, setToast] = useState<string | null>(null);
  const [reminders, setReminders] = useState<string[]>([]);
  const [asOfTimestamp, setAsOfTimestamp] = useState<number>(0);

  // Load events once from API for the chosen observer coords
  const fetchAllEvents = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({ lat, lon });
      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load events");

      setRawEvents(data.events ?? []);
      setMoon(data.moon ?? null);
      setWarnings(data.warnings ?? []);
      setAsOfTimestamp(Date.now());
      if (isManualRefresh) {
        setToast("Live satellite and rocket launch feeds refreshed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lat, lon]);

  // Initial fetch on mount or when observer location changes
  useEffect(() => {
    void fetchAllEvents(false);
  }, [fetchAllEvents]);

  // ULTRA-FAST IN-MEMORY FILTERING (0ms response time as user types!)
  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTime = from ? Date.parse(from) : -Infinity;
    const toTime = to ? Date.parse(to) + 86400000 : Infinity;
    const cutoff = asOfTimestamp ? asOfTimestamp - 86400000 : -Infinity;

    return rawEvents.filter((e) => {
      // 1. Type filter
      if (types.length > 0 && !types.includes(e.type)) {
        return false;
      }

      // 2. Date filters
      const startTime = Date.parse(e.startTime);
      if (startTime < cutoff) return false;
      if (startTime < fromTime || startTime > toTime) return false;

      // 3. Instant search query match across title, description, source, and metadata
      if (q) {
        const titleMatch = e.title.toLowerCase().includes(q);
        const descMatch = e.description.toLowerCase().includes(q);
        const sourceMatch = e.source.toLowerCase().includes(q);
        const typeMatch = e.type.replace("_", " ").toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !sourceMatch && !typeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [rawEvents, query, types, from, to, asOfTimestamp]);

  // Category counts for interactive chips
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: rawEvents.length };
    for (const t of ALL_TYPES) {
      counts[t.type] = rawEvents.filter((e) => e.type === t.type).length;
    }
    return counts;
  }, [rawEvents]);

  function toggleType(t: CelestialEventType) {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  function selectAllTypes() {
    setTypes(ALL_TYPES.map((t) => t.type));
  }

  function clearAllFilters() {
    setQuery("");
    setFrom("");
    setTo("");
    selectAllTypes();
  }

  // Quick preset filters
  function setPresetNext7Days() {
    const now = new Date();
    const in7 = new Date(Date.now() + 7 * 86400000);
    setFrom(now.toISOString().slice(0, 10));
    setTo(in7.toISOString().slice(0, 10));
  }

  function setPresetAll2026() {
    setFrom("2026-01-01");
    setTo("2026-12-31");
  }

  // Handle date selection from Lunar Mini Calendar
  const handleCalendarDateSelect = (dateIso: string) => {
    setFrom(dateIso);
    setTo(dateIso);
    const element = document.getElementById("events-search-bar");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  async function requestReminder(event: CelestialEvent) {
    if (!("Notification" in window)) {
      setToast("Browser notifications are not supported in this browser.");
      return;
    }
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      setToast("Notification permission not granted.");
      return;
    }

    setReminders((prev) =>
      prev.includes(event.id) ? prev : [...prev, event.id],
    );
    setToast(
      `In-app reminder set for “${event.title}”. Notifications fire while this tab remains open.`,
    );

    const start = Date.parse(event.startTime);
    const delay = start - Date.now() - 30 * 60 * 1000;
    if (delay > 0 && delay < 2147483647) {
      window.setTimeout(() => {
        new Notification("Tsukuyomi Watch reminder", {
          body: `${event.title} begins around ${event.startTime} (UTC).`,
        });
      }, delay);
    } else if (delay <= 0) {
      new Notification("Tsukuyomi Watch reminder", {
        body: `${event.title} is already near/at its start time.`,
      });
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* 1. LUNAR MINI CALENDAR & NEXT FULL MOONS */}
      <section>
        <LunarMiniCalendar
          onSelectDate={handleCalendarDateSelect}
          selectedDateIso={from === to ? from : undefined}
        />
      </section>

      {/* 2. INTERACTIVE & ULTRA-FAST SEARCH EVENTS SECTION */}
      <section id="events-search-bar" className="scroll-mt-20 space-y-4">
        <div className="ink-panel rounded-lg p-5 border border-[var(--border)] shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base text-[var(--gold)]">🔍</span>
                <span className="font-serif text-sm text-[var(--crimson-bright)]">事象検索</span>
                <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)]">
                  Search & Filter Celestial Events
                </h3>
              </div>
              <p className="text-xs text-[var(--mist)]">
                Instant in-memory search across meteor showers, eclipses, rocket launches, and ISS passes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[rgba(196,163,90,0.15)] border border-[var(--border)] px-3 py-1 text-xs font-mono text-[var(--gold-soft)]">
                Showing {filteredEvents.length} of {rawEvents.length} events
              </span>
              <button
                type="button"
                onClick={() => void fetchAllEvents(true)}
                disabled={refreshing}
                className="rounded-sm bg-[var(--crimson)] px-3 py-1.5 text-xs text-white hover:bg-[var(--crimson-bright)] transition disabled:opacity-50"
              >
                {refreshing ? "Refreshing…" : "↻ Refresh Feeds"}
              </button>
            </div>
          </div>

          {/* Interactive Fast Search Input Bar */}
          <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-[var(--gold)]">
                ⚡
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search events instantaneously (e.g. Perseids, Falcon, ISS, Eclipse)…"
                className="w-full rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.7)] py-2.5 pl-8 pr-8 text-xs text-[var(--moonlight)] placeholder:text-[var(--mist)]/60 focus:border-[var(--gold)] outline-none transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xs text-[var(--mist)] hover:text-white"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div>
              <label className="sr-only">From date</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-3 py-2 text-xs text-[var(--moonlight)] focus:border-[var(--gold)] outline-none"
                aria-label="From date"
              />
            </div>

            <div>
              <label className="sr-only">To date</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-3 py-2 text-xs text-[var(--moonlight)] focus:border-[var(--gold)] outline-none"
                aria-label="To date"
              />
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-md border border-[var(--border)] bg-[rgba(18,26,43,0.6)] px-3 py-2 text-xs text-[var(--mist)] hover:text-[var(--gold-soft)] hover:border-[var(--gold)] transition"
            >
              Reset Filters
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] text-[var(--mist)]">Quick Presets:</span>
            <button
              type="button"
              onClick={setPresetNext7Days}
              className="rounded-sm border border-[var(--border)] bg-[rgba(196,163,90,0.06)] px-2.5 py-1 text-[11px] text-[var(--gold-soft)] hover:border-[var(--gold)]"
            >
              🗓️ Next 7 Days
            </button>
            <button
              type="button"
              onClick={setPresetAll2026}
              className="rounded-sm border border-[var(--border)] bg-[rgba(196,163,90,0.06)] px-2.5 py-1 text-[11px] text-[var(--gold-soft)] hover:border-[var(--gold)]"
            >
              📜 All 2026 Calendar
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFrom("");
                setTo("");
                setTypes(["meteor_shower"]);
              }}
              className="rounded-sm border border-[var(--border)] bg-[rgba(196,163,90,0.06)] px-2.5 py-1 text-[11px] text-[var(--gold-soft)] hover:border-[var(--gold)]"
            >
              ☄️ Only Meteor Showers
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFrom("");
                setTo("");
                setTypes(["eclipse"]);
              }}
              className="rounded-sm border border-[var(--border)] bg-[rgba(196,163,90,0.06)] px-2.5 py-1 text-[11px] text-[var(--gold-soft)] hover:border-[var(--gold)]"
            >
              🌑 Only Eclipses
            </button>
          </div>

          {/* Interactive Category Filter Chips with Live Badges */}
          <div className="pt-2 border-t border-[var(--border)] flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selectAllTypes}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                types.length === ALL_TYPES.length
                  ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--void)] font-bold shadow-[0_0_8px_rgba(196,163,90,0.4)]"
                  : "border-[var(--border)] bg-[rgba(5,7,13,0.6)] text-[var(--mist)] hover:text-[var(--moonlight)]"
              }`}
            >
              All Types ({categoryCounts.all ?? 0})
            </button>

            {ALL_TYPES.map((t) => {
              const active = types.includes(t.type);
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => toggleType(t.type)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition flex items-center gap-1.5 ${
                    active
                      ? "border-[var(--gold)] bg-[rgba(196,163,90,0.18)] text-[var(--gold-soft)] shadow-[0_0_8px_rgba(196,163,90,0.2)]"
                      : "border-[var(--border)] bg-[rgba(5,7,13,0.5)] text-[var(--mist)]/70 hover:text-[var(--mist)]"
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  <span className="rounded-full bg-[rgba(5,7,13,0.8)] px-1.5 py-0.2 text-[10px] font-mono text-[var(--gold)]">
                    {categoryCounts[t.type] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Observer GPS Coordinates for Live Orbit Satellites */}
          <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-4 text-xs text-[var(--mist)]">
            <span>Observer Lat:</span>
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-24 rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-2 py-1 text-xs text-[var(--moonlight)] font-mono"
            />
            <span>Observer Lon:</span>
            <input
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="w-24 rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-2 py-1 text-xs text-[var(--moonlight)] font-mono"
            />
            <button
              type="button"
              onClick={() => void fetchAllEvents(true)}
              className="text-xs text-[var(--gold)] hover:underline"
            >
              Update Satellite Pass Calculations →
            </button>
          </div>
        </div>
      </section>

      {/* Warnings & Notices */}
      {warnings.length > 0 && (
        <div className="rounded-md border border-[rgba(184,134,11,0.4)] bg-[rgba(184,134,11,0.08)] px-4 py-3 text-xs text-[var(--gold-soft)]">
          <ul className="list-disc space-y-1 pl-4">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {loading && <LoadingState label="Calculating celestial events and orbital trajectories…" />}
      {error && <ErrorState message={error} onRetry={() => void fetchAllEvents(true)} />}

      {/* Results or Empty State */}
      {!loading && !error && filteredEvents.length === 0 && (
        <EmptyState
          title="No events match your criteria"
          message="Try clearing your search query, widening the date range, or clicking 'All Types' above."
        />
      )}

      {/* 3. EVENT RESULTS & DETAIL INSPECTION GRID */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Events Cards Column */}
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              selected={selected?.id === event.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Selected Event Detail Inspector */}
        <div className="sticky top-20 h-fit space-y-4">
          <div className="ink-panel rounded-lg p-6 border border-[var(--border)] shadow-xl">
            {selected ? (
              <div className="space-y-4">
                <div className="border-b border-[var(--border)] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[var(--gold)] font-mono font-medium">
                      {selected.type.replace("_", " ")}
                    </span>
                    <span className="rounded-full bg-[rgba(196,163,90,0.12)] border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--gold-soft)] font-mono">
                      {selected.dataProvenance}
                    </span>
                  </div>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)]">
                    {selected.title}
                  </h2>
                </div>

                <p className="text-xs leading-relaxed text-[var(--mist)]">
                  {selected.description}
                </p>

                <dl className="space-y-2.5 text-xs border-t border-[var(--border)] pt-3">
                  <div className="flex justify-between">
                    <dt className="text-[var(--mist)]">Start Time (UTC):</dt>
                    <dd className="font-mono text-[var(--moonlight)] font-medium">
                      {selected.startTime}
                    </dd>
                  </div>
                  {selected.endTime && (
                    <div className="flex justify-between">
                      <dt className="text-[var(--mist)]">End Time (UTC):</dt>
                      <dd className="font-mono text-[var(--moonlight)]">
                        {selected.endTime}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-[var(--mist)]">Data Source:</dt>
                    <dd>
                      {selected.sourceUrl ? (
                        <a
                          href={selected.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--gold-soft)] underline hover:text-[var(--gold)]"
                        >
                          {selected.source} ↗
                        </a>
                      ) : (
                        <span className="text-[var(--moonlight)]">{selected.source}</span>
                      )}
                    </dd>
                  </div>
                  {selected.visibilityGuidance && (
                    <div className="pt-2 border-t border-[var(--border)]/40">
                      <dt className="text-[var(--gold-soft)] font-medium mb-1">
                        Viewing Guidance:
                      </dt>
                      <dd className="text-xs text-[var(--mist)] leading-relaxed">
                        {selected.visibilityGuidance}
                      </dd>
                    </div>
                  )}
                </dl>

                <button
                  type="button"
                  onClick={() => void requestReminder(selected)}
                  className="w-full rounded-md bg-[var(--crimson)] py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_10px_rgba(196,69,77,0.4)] transition hover:bg-[var(--crimson-bright)]"
                >
                  {reminders.includes(selected.id)
                    ? "✓ In-Tab Reminder Armed"
                    : "⏰ Set Stargazing Reminder"}
                </button>
                <p className="text-[10px] text-[var(--mist)]/70 text-center">
                  Notifications fire while this browser tab remains active.
                </p>
              </div>
            ) : (
              <div className="text-center py-10 space-y-2 text-[var(--mist)]">
                <span className="text-3xl">📜</span>
                <p className="font-[family-name:var(--font-display)] text-lg text-[var(--moonlight)]">
                  Select an event from the list
                </p>
                <p className="text-xs">
                  Click any event card on the left to inspect scientific source attribution, orbital details, and set viewing alarms.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
