import Link from "next/link";
import { Suspense } from "react";
import { DojoSummary } from "@/components/dashboard/DojoSummary";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { HomeHeroInteractive } from "@/components/home/HomeHeroInteractive";
import { HomeHub } from "@/components/home/HomeHub";
import { CelestialSolarOrrery } from "@/components/home/CelestialSolarOrrery";
import { CelestialGlowCard } from "@/components/ui/CelestialGlowCard";
import { DailyCelestialFortune } from "@/components/home/DailyCelestialFortune";
import { HonorAndRewardSection } from "@/components/home/HonorAndRewardSection";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { NAV_LINKS } from "@/lib/constants";

const FOUR_PATHS = [
  {
    href: "/watchtower",
    title: "The Watchtower",
    kanji: "見張台",
    icon: "🏯",
    body: "Find observing windows with live weather forecasts and an explainable Night Honor Score.",
    tag: "Stargazing Finder",
    glow: "gold" as const,
  },
  {
    href: "/celestial-scroll",
    title: "The Celestial Scroll",
    kanji: "天体巻物",
    icon: "📜",
    body: "Track meteor showers, eclipses, moon phases, ISS passes, and rocket launches with honest source attribution.",
    tag: "Event Tracker",
    glow: "cyan" as const,
  },
  {
    href: "/spirit-lens",
    title: "The Spirit Lens",
    kanji: "霊眼レンズ",
    icon: "🔮",
    body: "Upload astronomical images for qualitative restoration and candidate star / nebula detection.",
    tag: "Astro Image AI",
    glow: "crimson" as const,
  },
  {
    href: "#dojo-summary",
    title: "The Dojo Sanctuary",
    kanji: "道場聖域",
    icon: "⛩️",
    body: "Live atmospheric analytics, real-time lunar telemetry, and celestial honor rank breakdown.",
    tag: "Telemetry & Score",
    glow: "gold" as const,
  },
] as const;

export default function DojoDashboardPage() {
  return (
    <div className="space-y-16">
      {/* Interactive Japanese Home Hero */}
      <HomeHeroInteractive />

      {/* Direct Auth, Passport & Interactive Quick Sky Probe Hub */}
      <HomeHub />

      {/* Daily Stargazer Celestial Fortune & Wisdom (Omikuji) */}
      <DailyCelestialFortune />

      {/* Moving Earth & Planetary Space Orrery Animation */}
      <section className="animate-fade-up">
        <Suspense fallback={<LoadingState label="Aligning celestial planetary orrery…" />}>
          <CelestialSolarOrrery />
        </Suspense>
      </section>

      {/* Live Atmospheric Telemetry & Moon Phase */}
      <div id="dojo-summary" className="scroll-mt-20">
        <Suspense fallback={<LoadingState label="Gathering Dojo telemetry…" />}>
          <DojoSummary />
        </Suspense>
      </div>

      {/* Four Paths Section - Exactly 4 modules with Celestial Star Glow on Cursor Hover */}
      <section>
        <PageHeader
          eyebrow="Tsukuyomi Four Paths"
          title="Four paths under one sky"
          description="Explore all four specialized astronomy modules. Hover your cursor over any path to awaken its celestial starlight aura."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FOUR_PATHS.map((mod) => (
            <CelestialGlowCard key={mod.title} glowColor={mod.glow} className="h-full">
              <Link
                href={mod.href}
                className="flex flex-col justify-between h-full p-5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--mist)]">
                    <span className="font-serif text-sm text-[var(--crimson-bright)]">
                      {mod.kanji}
                    </span>
                    <span className="text-xl">{mod.icon}</span>
                  </div>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)] group-hover:text-[var(--gold)]">
                    {mod.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--mist)]">
                    {mod.body}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--gold)] font-mono">
                    {mod.tag}
                  </span>
                  <span className="text-xs text-[var(--crimson-bright)] font-medium transition group-hover:translate-x-1">
                    Enter →
                  </span>
                </div>
              </Link>
            </CelestialGlowCard>
          ))}
        </div>
      </section>

      {/* Honor and Reward Section */}
      <HonorAndRewardSection />

      {/* Subscription Plans Section */}
      <SubscriptionPlans />

      {/* Japanese Celestial Navigation Scroll */}
      <section className="ink-panel rounded-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🌸</span>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--moonlight)]">
            Celestial Directory & Quick Jump
          </h2>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between rounded-sm border border-transparent px-3 py-2 text-sm text-[var(--mist)] transition hover:border-[var(--border)] hover:text-[var(--moonlight)] hover:bg-[rgba(196,163,90,0.06)]"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs text-[var(--gold-soft)]">✦</span>
                  <span>{link.label}</span>
                </span>
                <span className="text-xs text-[var(--gold)]">{link.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
