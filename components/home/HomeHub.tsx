"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { CelestialGlowCard } from "@/components/ui/CelestialGlowCard";

export function HomeHub() {
  const { user, isLoggedIn, login, continueAsGuest, logout } = useAuth();

  // Homepage quick login / signup state
  const [authTab, setAuthTab] = useState<"signin" | "signup" | "guest">("guest");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Quick Stargazing Probe state
  const [probeCity, setProbeCity] = useState("Tokyo");
  const [probeLoading, setProbeLoading] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    city: string;
    cloud: number;
    humidity: number;
    visibility: number;
    score: number;
    label: string;
  } | null>({
    city: "Tokyo",
    cloud: 12,
    humidity: 45,
    visibility: 24,
    score: 86.4,
    label: "favorable",
  });

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(name || "Samurai Stargazer", email);
    setAuthSuccessMsg(`Welcome, ${name || "Samurai Stargazer"}! You are now enrolled.`);
    setTimeout(() => setAuthSuccessMsg(null), 4000);
  };

  const handleQuickProbe = async (cityName: string) => {
    setProbeLoading(true);
    try {
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(cityName)}`);
      const geoData = await geoRes.json();
      if (geoData.results?.length) {
        const place = geoData.results[0];
        const wRes = await fetch(`/api/weather?lat=${place.latitude}&lon=${place.longitude}`);
        const wData = await wRes.json();
        const hour = wData.hourly?.[0];
        if (hour) {
          const cloud = hour.cloudCover ?? 20;
          const hum = hour.humidity ?? 50;
          const vis = (hour.visibilityMeters ?? 20000) / 1000;
          // Approximate quick score
          const score = Math.round((100 - cloud * 0.5 - hum * 0.2 + Math.min(vis, 20)) * 10) / 10;
          const label = score >= 70 ? "favorable" : score >= 40 ? "moderate" : "poor";
          setProbeResult({
            city: place.name,
            cloud,
            humidity: hum,
            visibility: vis,
            score: Math.min(100, Math.max(0, score)),
            label,
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setProbeLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. HOMEPAGE PORTAL: DIRECT AUTH & GUEST OPTIONS */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Authentic Welcome & Persona Passport */}
        <CelestialGlowCard glowColor="gold" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--gold)]">
                <span>⛩️</span>
                <span>Samurai Identity & Stargazer Passport</span>
              </span>
              <span className="rounded-full bg-[rgba(196,163,90,0.15)] px-2 py-0.5 text-[10px] text-[var(--gold-soft)] font-mono">
                {isLoggedIn ? "Clan Member" : "Guest Mode (Active)"}
              </span>
            </div>

            <div className="mt-4 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--torii)] border-2 border-[var(--gold)] text-xl font-serif text-[var(--moonlight)] shadow-[0_0_15px_rgba(196,163,90,0.4)]">
                {isLoggedIn ? "侍" : "浪"}
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)]">
                  {user.name}
                </h3>
                <p className="text-xs text-[var(--mist)]">{user.title} · {user.rank}</p>
                <p className="mt-1 text-xs text-[var(--moonlight)]">
                  Observing Ground: <span className="text-[var(--gold)] font-medium">{user.homeBase}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.6)] p-3 text-center text-xs">
              <div>
                <span className="block text-[10px] text-[var(--mist)] uppercase">Honor Score</span>
                <span className="font-mono text-sm text-[var(--gold)] font-bold">{user.honorPoints} pts</span>
              </div>
              <div>
                <span className="block text-[10px] text-[var(--mist)] uppercase">Access Level</span>
                <span className="text-xs text-[var(--success)] font-medium">Full Unlocked</span>
              </div>
              <div>
                <span className="block text-[10px] text-[var(--mist)] uppercase">Telemetry</span>
                <span className="text-xs text-[var(--moonlight)]">Live Sync</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-[var(--mist)]">
              {isLoggedIn
                ? "Your celestial sessions and observations are attached to your persona."
                : "You are currently exploring as a Ronin Guest with zero barrier."}
            </span>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={logout}
                className="text-xs text-[var(--crimson-bright)] hover:underline"
              >
                Sign Out (Return to Guest)
              </button>
            ) : null}
          </div>
        </CelestialGlowCard>

        {/* Right: Direct Sign In / Login / Guest Mode Panel */}
        <CelestialGlowCard glowColor="crimson" className="p-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--gold-soft)]">
              Enter the Stargazer Guild
            </h3>
            <span className="text-sm">🌸</span>
          </div>

          {/* Tab Selector */}
          <div className="mt-3 flex rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.8)] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setAuthTab("signin")}
              className={`flex-1 py-1.5 rounded-xs transition ${
                authTab === "signin"
                  ? "bg-[var(--gold)] text-[var(--void)] font-semibold"
                  : "text-[var(--mist)] hover:text-[var(--moonlight)]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthTab("signup")}
              className={`flex-1 py-1.5 rounded-xs transition ${
                authTab === "signup"
                  ? "bg-[var(--gold)] text-[var(--void)] font-semibold"
                  : "text-[var(--mist)] hover:text-[var(--moonlight)]"
              }`}
            >
              Sign Up (Register)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab("guest");
                continueAsGuest();
              }}
              className={`flex-1 py-1.5 rounded-xs transition ${
                authTab === "guest"
                  ? "bg-[var(--crimson)] text-white font-semibold"
                  : "text-[var(--mist)] hover:text-[var(--moonlight)]"
              }`}
            >
              🗡️ Guest Mode
            </button>
          </div>

          {authSuccessMsg && (
            <p className="mt-3 rounded-sm bg-[rgba(61,122,95,0.2)] border border-[var(--success)] p-2 text-xs text-[var(--success)]">
              {authSuccessMsg}
            </p>
          )}

          {/* Form */}
          {authTab === "guest" ? (
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-[var(--mist)]">
              <p>
                <strong className="text-[var(--gold-soft)]">Guest Mode (浪人 Ronin) is active.</strong> You don&apos;t need to log in to use the Watchtower, track rocket launches, view moon phases, or run image restorations.
              </p>
              <div className="flex gap-2 pt-2">
                <Link
                  href="/watchtower"
                  className="rounded-sm bg-[var(--crimson)] px-3 py-2 text-xs text-white hover:bg-[var(--crimson-bright)]"
                >
                  Launch Watchtower →
                </Link>
                <Link
                  href="/spirit-lens"
                  className="rounded-sm border border-[var(--border)] px-3 py-2 text-xs text-[var(--gold-soft)] hover:bg-[rgba(196,163,90,0.1)]"
                >
                  Open Spirit Lens →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="mt-4 space-y-2.5">
              {authTab === "signup" && (
                <div>
                  <label className="text-[11px] text-[var(--mist)]">Samurai Name / Callsign</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Musashi / Vineet"
                    required
                    className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-2.5 py-1.5 text-xs text-[var(--moonlight)] outline-none focus:border-[var(--gold)]"
                  />
                </div>
              )}
              <div>
                <label className="text-[11px] text-[var(--mist)]">Scroll Email / Handle</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="stargazer@samurai.io"
                  required
                  className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-2.5 py-1.5 text-xs text-[var(--moonlight)] outline-none focus:border-[var(--gold)]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--mist)]">Secret Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-2.5 py-1.5 text-xs text-[var(--moonlight)] outline-none focus:border-[var(--gold)]"
                />
              </div>
              <button
                type="submit"
                className="mt-3 w-full rounded-sm bg-[var(--crimson)] py-2 text-xs font-medium text-white transition hover:bg-[var(--crimson-bright)]"
              >
                {authTab === "signin" ? "Sign In as Samurai" : "Enroll & Create Passport"}
              </button>
            </form>
          )}
        </CelestialGlowCard>
      </section>

      {/* 2. HOMEPAGE INTERACTIVE QUICK PROBE: TEST WATCHTOWER DIRECTLY */}
      <section>
        <CelestialGlowCard glowColor="cyan" className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
            <div>
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--gold)] font-medium">
                🏯 Interactive Live Sky Probe
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)] mt-0.5">
                Instant Stargazing Suitability Check
              </h3>
            </div>
            <span className="text-xs text-[var(--mist)]">Powered by Open-Meteo CC BY 4.0</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["Tokyo", "Hanle", "Bengaluru", "London", "Mauna Kea", "New York"].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setProbeCity(city);
                  void handleQuickProbe(city);
                }}
                className={`rounded-sm border px-3 py-1 text-xs transition ${
                  probeCity === city
                    ? "border-[var(--gold)] bg-[rgba(196,163,90,0.15)] text-[var(--gold-soft)] font-semibold"
                    : "border-[var(--border)] text-[var(--mist)] hover:text-[var(--moonlight)]"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {probeLoading ? (
            <p className="mt-4 text-xs text-[var(--mist)] animate-pulse">
              Probing atmospheric cloud layers and transparency for {probeCity}…
            </p>
          ) : probeResult ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-4 rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.7)] p-4 text-xs">
              <div>
                <span className="text-[var(--mist)] block">Selected Site</span>
                <span className="font-semibold text-sm text-[var(--moonlight)]">{probeResult.city}</span>
              </div>
              <div>
                <span className="text-[var(--mist)] block">Cloud Cover</span>
                <span className="font-mono text-sm text-[var(--gold-soft)]">{probeResult.cloud}%</span>
              </div>
              <div>
                <span className="text-[var(--mist)] block">Visibility</span>
                <span className="font-mono text-sm text-[var(--moonlight)]">{probeResult.visibility.toFixed(1)} km</span>
              </div>
              <div>
                <span className="text-[var(--mist)] block">Night Honor Rating</span>
                <span className="font-mono text-sm font-bold text-[var(--gold)]">
                  {probeResult.score} / 100 ({probeResult.label})
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex justify-end">
            <Link
              href="/watchtower"
              className="text-xs text-[var(--crimson-bright)] hover:underline"
            >
              Open Full Interactive Watchtower Map with All 6 Curated Dark Sky Observatories →
            </Link>
          </div>
        </CelestialGlowCard>
      </section>
    </div>
  );
}

