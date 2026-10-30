"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function HomeHeroInteractive() {
  const { user, isLoggedIn, openAuthModal, continueAsGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<"welcome" | "philosophy" | "telemetry">("welcome");

  return (
    <section className="relative overflow-hidden rounded-md border border-[var(--border-strong)] bg-[rgba(11,18,32,0.85)] px-6 py-10 sm:px-10 sm:py-14 shadow-2xl">
      {/* Ambient Torii & Crimson Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(196,69,77,0.25)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[rgba(107,31,40,0.3)] to-transparent"
      />

      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[var(--gold)]">
          <span className="text-sm">⛩️</span>
          <span>月読の道 · The Way of Tsukuyomi</span>
        </div>

        {/* User status badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[rgba(18,26,43,0.8)] px-2.5 py-1 text-xs text-[var(--mist)]">
            <span
              className={`h-2 w-2 rounded-full ${
                isLoggedIn ? "bg-[var(--gold)]" : "bg-[var(--crimson-bright)]"
              }`}
            />
            <span>{isLoggedIn ? `Clan Member: ${user.name}` : "Guest Mode (Active)"}</span>
          </span>
        </div>
      </div>

      {/* Hero Headline */}
      <div className="mt-5 max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight tracking-wide text-[var(--gold-soft)] sm:text-5xl md:text-6xl">
          {APP_NAME}
        </h1>
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--moonlight)] sm:text-2xl">
          {APP_TAGLINE}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[var(--mist)] sm:text-base">
          An immersive Japanese celestial guide designed for amateur astronomers, deep-sky observers, and astrophotographers. Find dark skies, calculate live atmospheric suitability, track celestial passes, and restore cosmic imagery.
        </p>
      </div>

      {/* Interactive Tabs */}
      <div className="mt-8 border-b border-[var(--border)]">
        <div className="flex gap-4 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("welcome")}
            className={`pb-2.5 font-medium transition ${
              activeTab === "welcome"
                ? "border-b-2 border-[var(--gold)] text-[var(--gold-soft)]"
                : "text-[var(--mist)] hover:text-[var(--moonlight)]"
            }`}
          >
            🌸 Stargazer Gate
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("philosophy")}
            className={`pb-2.5 font-medium transition ${
              activeTab === "philosophy"
                ? "border-b-2 border-[var(--gold)] text-[var(--gold-soft)]"
                : "text-[var(--mist)] hover:text-[var(--moonlight)]"
            }`}
          >
            📜 The Samurai Code of the Sky
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("telemetry")}
            className={`pb-2.5 font-medium transition ${
              activeTab === "telemetry"
                ? "border-b-2 border-[var(--gold)] text-[var(--gold-soft)]"
                : "text-[var(--mist)] hover:text-[var(--moonlight)]"
            }`}
          >
            ✨ Quick Celestial Shortcuts
          </button>
        </div>
      </div>

      {/* Interactive Tab Panels */}
      <div className="mt-6">
        {activeTab === "welcome" && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-[var(--gold-soft)]">
                {isLoggedIn ? "Samurai Stargazer Profile" : "Guest Mode Exploration"}
              </p>
              <p className="text-sm text-[var(--moonlight)]">
                {isLoggedIn
                  ? `Logged in as ${user.name} · Rank: ${user.rank} (${user.honorPoints} pts)`
                  : "You are currently in Guest Mode. All tools are unlocked with zero friction."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {!isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="rounded-sm bg-[var(--crimson)] px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--moonlight)] transition hover:bg-[var(--crimson-bright)] shadow-[0_0_12px_rgba(196,69,77,0.4)]"
                  >
                    ⛩️ Sign In / Join Clan
                  </button>
                  <button
                    type="button"
                    onClick={continueAsGuest}
                    className="rounded-sm border border-[var(--border-strong)] bg-[rgba(196,163,90,0.08)] px-4 py-2.5 text-xs sm:text-sm text-[var(--gold-soft)] transition hover:bg-[rgba(196,163,90,0.18)]"
                  >
                    🗡️ Continue as Guest
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="rounded-sm border border-[var(--border)] px-4 py-2.5 text-xs sm:text-sm text-[var(--gold-soft)] hover:border-[var(--gold)]"
                >
                  Switch Persona / Edit Profile
                </button>
              )}

              <Link
                href="/watchtower"
                className="rounded-sm border border-[var(--border)] px-4 py-2.5 text-xs sm:text-sm text-[var(--moonlight)] hover:border-[var(--gold)]"
              >
                Launch Watchtower →
              </Link>
            </div>
          </div>
        )}

        {activeTab === "philosophy" && (
          <div className="grid gap-3 sm:grid-cols-3 text-xs leading-relaxed text-[var(--mist)] animate-fade-up">
            <div className="rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.5)] p-3">
              <span className="text-[var(--gold-soft)] font-serif text-sm block mb-1">誠 · Scientific Honesty</span>
              Weather forecasts and model inferences are honestly presented without claiming unverified astronomical facts.
            </div>
            <div className="rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.5)] p-3">
              <span className="text-[var(--gold-soft)] font-serif text-sm block mb-1">仁 · Respect for the Night</span>
              Prioritize unpolluted dark skies and celebrate celestial bodies from pristine high-altitude observation grounds.
            </div>
            <div className="rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.5)] p-3">
              <span className="text-[var(--gold-soft)] font-serif text-sm block mb-1">勇 · The Curious Eye</span>
              Enhance deep-sky photos and identify candidate stellar groupings with classical & neural signal pipelines.
            </div>
          </div>
        )}

        {activeTab === "telemetry" && (
          <div className="grid gap-3 sm:grid-cols-3 text-xs animate-fade-up">
            <Link
              href="/watchtower"
              className="flex items-center justify-between rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.5)] p-3 hover:border-[var(--gold)]"
            >
              <div>
                <p className="text-[var(--gold-soft)] font-medium">Stargazing Finder</p>
                <p className="text-[11px] text-[var(--mist)]">Check atmospheric score & cloud cover</p>
              </div>
              <span className="text-base">🏯</span>
            </Link>
            <Link
              href="/celestial-scroll"
              className="flex items-center justify-between rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.5)] p-3 hover:border-[var(--gold)]"
            >
              <div>
                <p className="text-[var(--gold-soft)] font-medium">Space Event Scroll</p>
                <p className="text-[11px] text-[var(--mist)]">Meteor showers, eclipses & ISS passes</p>
              </div>
              <span className="text-base">📜</span>
            </Link>
            <Link
              href="/spirit-lens"
              className="flex items-center justify-between rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.5)] p-3 hover:border-[var(--gold)]"
            >
              <div>
                <p className="text-[var(--gold-soft)] font-medium">Spirit Lens AI</p>
                <p className="text-[11px] text-[var(--mist)]">Astro photo restoration & star detection</p>
              </div>
              <span className="text-base">🔮</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

