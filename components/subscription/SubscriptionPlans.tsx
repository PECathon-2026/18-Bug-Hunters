"use client";

import { useState } from "react";
import { useAuth, type SubscriptionTier } from "@/lib/auth/auth-context";
import { CelestialGlowCard } from "@/components/ui/CelestialGlowCard";
import { Toast } from "@/components/ui/Toast";

type PlanDef = {
  id: SubscriptionTier;
  name: string;
  kanji: string;
  priceLabel: string;
  priceYen: number;
  cadence: string;
  badge?: string;
  tagline: string;
  glow: "cyan" | "gold" | "crimson";
  features: string[];
};

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free (Ronin Traveler)",
    kanji: "浪人",
    priceLabel: "Free of cost",
    priceYen: 0,
    cadence: "Free of cost · 0 円 Forever",
    tagline: "Essential dark-sky instruments for wandering stargazers and amateur sky watchers.",
    glow: "cyan",
    features: [
      "Real-time Open-Meteo weather forecasts & cloud layer transparency",
      "Explainable 5-Factor Night Honor Score (0–100 suitability rating)",
      "High-precision Moon Phase & lunar illumination calculations via astronomy-engine",
      "Curated 2026 Meteor Showers, Solar/Lunar Eclipses & Rocket Launches timeline",
      "Interactive Leaflet dark-sky map featuring 6 prime global observatories",
      "In-browser classical image enhancement (Unsharp Masking & noise reduction)",
      "In-browser candidate star point & nebular clump classification",
      "Ronin Clan Passport with local stargazing session bookmarks",
    ],
  },
  {
    id: "samurai",
    name: "Samurai (Samurai Stargazer)",
    kanji: "侍",
    priceLabel: "1,000 Yen",
    priceYen: 1000,
    cadence: "1,000 Yen (1,000 円) / month",
    badge: "Most Popular · 最も人気",
    tagline: "For active field astrophotographers and nocturnal stargazing samurai.",
    glow: "gold",
    features: [
      "Everything in Free Plan, plus:",
      "Neural Real-ESRGAN x4 AI Super-Resolution (FastAPI ONNX image pipeline)",
      "Live satellite & ISS pass tracking with exact horizon azimuth & elevation",
      "Launch Library 2 live rocket countdowns & orbital trajectory alerts",
      "Multi-Observatory Dark Sky Radar (compare up to 6 sites side-by-side)",
      "In-tab celestial event notifications & twilight audio-chime alarms",
      "Samurai Clan crest & 250 Celestial Honor Points welcome grant",
      "Exclusive community Dark Sky expedition chat & weather bulletins",
    ],
  },
  {
    id: "shogun",
    name: "Shogun (Shogun Commander)",
    kanji: "将軍",
    priceLabel: "1,500 Yen",
    priceYen: 1500,
    cadence: "1,500 Yen (1,500 円) / month",
    badge: "Supreme Guild · 最高峰",
    tagline: "Supreme commander privileges for deep-sky expeditions and observatory operators.",
    glow: "crimson",
    features: [
      "Everything in Samurai Plan, plus:",
      "Priority Deep-Sky AI Restoration Queue with tiled high-resolution inference",
      "Astronomical candidate catalog extraction (deep sky nebulae & star clusters up to 100 objects)",
      "Custom optical rig calibration (tune Night Honor Score weights for your telescope/sensor)",
      "Offline TLE ephemeris cache for remote mountain and off-grid desert expeditions",
      "Exportable stargazing observation logs (CSV & JSON scientific formats)",
      "Golden Shogun Imperial Crest & 600 Celestial Honor Points bonus",
      "50% partner discount on optical gear and lifetime membership perks",
    ],
  },
];

export function SubscriptionPlans() {
  const { user, selectPlan } = useAuth();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSelect = (plan: PlanDef) => {
    selectPlan(plan.id);
    if (plan.id === "free") {
      setToastMsg("Switched to Free Plan (Ronin). All core astronomical tools remain unlocked.");
    } else {
      setToastMsg(`Congratulations! Upgraded to ${plan.name} at ${plan.priceLabel} (${plan.cadence}).`);
    }
  };

  return (
    <section id="subscription-plans" className="scroll-mt-20 space-y-8 animate-fade-up">
      {/* Section Header with the requested quote */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)] bg-[rgba(196,163,90,0.1)] px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--gold-soft)]">
          <span>⛩️</span>
          <span>Subscription Plans · 階級の道</span>
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-wide text-[var(--moonlight)]">
          Subscription Plans
        </h2>

        {/* Required Quote */}
        <blockquote className="relative my-4 inline-block font-[family-name:var(--font-display)] text-xl sm:text-2xl text-[var(--gold-soft)] italic tracking-wide">
          <span className="text-[var(--crimson-bright)] font-serif text-3xl select-none mr-1">&ldquo;</span>
          choose how you stay and how long you stay
          <span className="text-[var(--crimson-bright)] font-serif text-3xl select-none ml-1">&rdquo;</span>
          <div className="gold-rule mt-2 mx-auto w-36" />
        </blockquote>

        <p className="text-xs sm:text-sm text-[var(--mist)] leading-relaxed max-w-2xl mx-auto">
          From wandering Ronin stargazers to supreme Shogun observatory commanders. Select your tier to unlock neural AI super-resolution, live orbital tracking, and deep-sky catalogs.
        </p>
      </div>

      {/* 3 Subscription Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = user.plan === plan.id;
          return (
            <CelestialGlowCard
              key={plan.id}
              glowColor={plan.glow}
              className={`flex flex-col justify-between p-6 sm:p-7 relative transition-all duration-300 ${isCurrent
                  ? "ring-2 ring-[var(--gold)] shadow-[0_0_30px_rgba(196,163,90,0.25)]"
                  : "hover:scale-[1.01]"
                }`}
            >
              <div>
                {/* Header with Kanji and Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xl text-[var(--crimson-bright)] font-bold">
                        {plan.kanji}
                      </span>
                      <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)]">
                        {plan.name}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--mist)] leading-relaxed">{plan.tagline}</p>
                  </div>

                  {plan.badge ? (
                    <span className="rounded-full bg-gradient-to-r from-[var(--crimson)] to-[var(--crimson-bright)] px-2.5 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap shadow-[0_0_10px_rgba(196,69,77,0.7)]">
                      {plan.badge}
                    </span>
                  ) : isCurrent ? (
                    <span className="rounded-full bg-[rgba(196,163,90,0.2)] border border-[var(--gold)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--gold-soft)] whitespace-nowrap">
                      Active
                    </span>
                  ) : null}
                </div>

                {/* Price Display */}
                <div className="my-5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl sm:text-4xl font-bold text-[var(--moonlight)]">
                      {plan.priceYen === 0 ? "Free" : `${plan.priceYen.toLocaleString()} 円`}
                    </span>
                    <span className="text-xs text-[var(--mist)] font-medium">
                      {plan.priceYen === 0 ? "free of cost" : "/ month (1,000 or 1,500 Yen)"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--gold)] font-mono">
                    {plan.priceYen === 0
                      ? "Zero payment · Instant access"
                      : `Billed monthly at ${plan.priceLabel} · Cancel anytime`}
                  </p>
                </div>

                {/* Feature List */}
                <ul className="space-y-2.5 text-xs text-[var(--mist)] border-t border-[var(--border)] pt-4">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[var(--gold-soft)] font-bold text-sm shrink-0">✦</span>
                      <span className={feat.startsWith("Everything") ? "text-[var(--gold-soft)] font-semibold" : "leading-relaxed"}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-7 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => handleSelect(plan)}
                  className={`w-full rounded-md py-3 text-xs font-bold uppercase tracking-wider transition duration-200 active:scale-[0.99] ${isCurrent
                      ? "bg-[rgba(196,163,90,0.18)] text-[var(--gold-soft)] border border-[var(--gold)] cursor-default shadow-[inset_0_0_10px_rgba(196,163,90,0.2)]"
                      : plan.id === "shogun"
                        ? "bg-gradient-to-r from-[var(--crimson)] to-[var(--crimson-bright)] text-white hover:brightness-110 shadow-[0_0_18px_rgba(196,69,77,0.6)]"
                        : plan.id === "samurai"
                          ? "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] text-[var(--void)] hover:brightness-105 shadow-[0_0_18px_rgba(196,163,90,0.5)]"
                          : "border border-[var(--border)] bg-[rgba(18,26,43,0.6)] text-[var(--moonlight)] hover:border-[var(--gold)] hover:bg-[rgba(196,163,90,0.1)]"
                    }`}
                >
                  {isCurrent
                    ? "✓ Current Active Plan"
                    : plan.priceYen === 0
                      ? "Select Free Plan (0 Yen)"
                      : `Upgrade to ${plan.name} (${plan.priceLabel}) →`}
                </button>
              </div>
            </CelestialGlowCard>
          );
        })}
      </div>

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} tone="success" />
    </section>
  );
}
