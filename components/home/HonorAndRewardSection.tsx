"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth/auth-context";
import { CelestialGlowCard } from "@/components/ui/CelestialGlowCard";
import { Toast } from "@/components/ui/Toast";

type SubSectionTab = "ranks" | "missions" | "discounts";

interface MissionDef {
  id: string;
  title: string;
  kanji: string;
  points: number;
  description: string;
  icon: string;
  difficulty: "Novice" | "Adept" | "Master";
}

const MISSIONS: MissionDef[] = [
  {
    id: "mission-vigil",
    title: "The First Starlight Vigil",
    kanji: "初星",
    points: 50,
    description: "Conduct your first atmospheric clarity probe in the Watchtower.",
    icon: "🔭",
    difficulty: "Novice",
  },
  {
    id: "mission-3nights",
    title: "Consecutive Night Watcher",
    kanji: "三夜",
    points: 150,
    description: "Record 3 consecutive nights of dark-sky observation under the stars.",
    icon: "🌌",
    difficulty: "Adept",
  },
  {
    id: "mission-spiritlens",
    title: "Spirit Lens AI Restoration",
    kanji: "霊眼",
    points: 100,
    description: "Upload an astronomical photo and run neural super-resolution or star detection.",
    icon: "🔮",
    difficulty: "Adept",
  },
  {
    id: "mission-orbital",
    title: "Orbital Satellite Chaser",
    kanji: "軌道",
    points: 120,
    description: "Track an active ISS orbital pass or upcoming rocket launch in Celestial Scroll.",
    icon: "🛰️",
    difficulty: "Adept",
  },
  {
    id: "mission-moon",
    title: "Full Moon Vigil & Phase Audit",
    kanji: "満月",
    points: 80,
    description: "Inspect live lunar illumination and calculate astronomical moonrise angles.",
    icon: "🌕",
    difficulty: "Novice",
  },
  {
    id: "mission-bortle1",
    title: "Bortle 1 Pilgrim Expedition",
    kanji: "極夜",
    points: 200,
    description: "Explore a remote Bortle Class 1 dark-sky sanctuary such as Hanle or Mauna Kea.",
    icon: "⛰️",
    difficulty: "Master",
  },
];

interface DiscountTier {
  pointsRequired: number;
  title: string;
  kanji: string;
  discountBadge: string;
  description: string;
  code: string;
  perkHighlight: string;
}

const DISCOUNT_TIERS: DiscountTier[] = [
  {
    pointsRequired: 300,
    title: "Ronin Stargazer Voucher",
    kanji: "浪人証",
    discountBadge: "10% OFF",
    description: "10% discount on any Tsukuyomi subscription tier or official Japanese sky planisphere.",
    code: "STAR300",
    perkHighlight: "Instant 10% voucher · Applies to all tiers",
  },
  {
    pointsRequired: 500,
    title: "Celestial Samurai Seal",
    kanji: "侍の印",
    discountBadge: "25% OFF",
    description: "25% OFF the Samurai Plan (pay only 750 Yen/month) or partner astrophotography filter sets.",
    code: "SAMURAI500",
    perkHighlight: "Save 250 Yen every month · Pay 750 Yen",
  },
  {
    pointsRequired: 1000,
    title: "Master of the Void Voucher",
    kanji: "虚空の主",
    discountBadge: "100% FREE",
    description: "1 Month 100% FREE Samurai Plan OR 35% OFF the Annual Shogun Commander Plan.",
    code: "TSUKUYOMI1000",
    perkHighlight: "1 Month Free Samurai (1,000 Yen savings) or 35% Off Shogun",
  },
  {
    pointsRequired: 1500,
    title: "Grand Shogun Imperial Decree",
    kanji: "将軍令",
    discountBadge: "50% LIFETIME",
    description: "50% LIFETIME discount on Shogun Commander Tier (Save 750 Yen every month forever).",
    code: "SHOGUN1500",
    perkHighlight: "Pay only 750 Yen/month for Shogun (Forever)",
  },
];

export function HonorAndRewardSection() {
  const { user, addHonorPoints, completeMission, redeemDiscount } = useAuth();
  const [activeTab, setActiveTab] = useState<SubSectionTab>("ranks");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});
  const [simulatedNightWatched, setSimulatedNightWatched] = useState(false);

  // Handle mission completion
  const handleClaimMission = (m: MissionDef) => {
    const success = completeMission(m.id, m.points);
    if (success) {
      setToastMsg(`Mission Accomplished! Earned +${m.points} Honor Points for "${m.title}".`);
    } else {
      setToastMsg(`Mission "${m.title}" has already been claimed.`);
    }
  };

  // Handle night watch simulation (+30 pts)
  const handleLogNightWatch = () => {
    addHonorPoints(30);
    setSimulatedNightWatched(true);
    setToastMsg("Night Sky Vigil logged! +30 Honor Points awarded for tonight's observation.");
    setTimeout(() => setSimulatedNightWatched(false), 2500);
  };

  // Handle discount reveal & copy
  const handleRedeemDiscount = (tier: DiscountTier) => {
    if (user.honorPoints < tier.pointsRequired) {
      setToastMsg(`You need ${tier.pointsRequired - user.honorPoints} more Honor Points to unlock this discount.`);
      return;
    }
    setRevealedCodes((prev) => ({ ...prev, [tier.code]: true }));
    redeemDiscount(tier.code);
    navigator.clipboard?.writeText(tier.code);
    setToastMsg(`Coupon code "${tier.code}" copied to clipboard! Applied to checkout.`);
  };

  // Leaderboard data with dynamic user position
  const leaderboardEntries = [
    { rank: 1, name: "Miyamoto Musashi", title: "Grand Shogun Master", points: 2850, nights: 48, base: "Hanle High Plateau", badge: "👑 Shogun" },
    { rank: 2, name: "Tomoe Gozen", title: "Celestial Valkyrie", points: 2120, nights: 36, base: "Mauna Kea Summit", badge: "⚔️ Samurai" },
    {
      rank: 3,
      name: `${user.name} (You)`,
      title: user.title,
      points: user.honorPoints,
      nights: Math.floor(user.honorPoints / 30) + 7,
      base: user.homeBase,
      badge: user.plan === "shogun" ? "将軍 Shogun" : user.plan === "samurai" ? "侍 Samurai" : "浪人 Ronin",
      isUser: true,
    },
    { rank: 4, name: "Kenshin Himura", title: "Ronin Sky Pilgrim", points: 1450, nights: 29, base: "Mt. Fuji 5th Station", badge: "🗡️ Ronin" },
    { rank: 5, name: "Sei Shonagon", title: "Pillow Book Observer", points: 980, nights: 19, base: "Kyoto Highlands", badge: "📜 Scholar" },
    { rank: 6, name: "Hattori Hanzo", title: "Shadow Stargazer", points: 720, nights: 14, base: "Iga Mountain Pass", badge: "🥷 Shinobi" },
  ].sort((a, b) => b.points - a.points).map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <section id="honor-reward" className="scroll-mt-20 space-y-8 animate-fade-up">
      {/* 1. Header with Required Quote */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)] bg-[rgba(196,163,90,0.12)] px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--gold-soft)]">
          <span>⛩️</span>
          <span>Honor & Reward Section · 誉れと報酬</span>
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-wide text-[var(--moonlight)]">
          Honor and Reward
        </h2>

        {/* Required Quote */}
        <blockquote className="relative my-4 inline-block font-[family-name:var(--font-display)] text-xl sm:text-2xl text-[var(--gold-soft)] italic tracking-wide">
          <span className="text-[var(--crimson-bright)] font-serif text-3xl select-none mr-1">&ldquo;</span>
          Every night watched earns its honor
          <span className="text-[var(--crimson-bright)] font-serif text-3xl select-none ml-1">&rdquo;</span>
          <div className="gold-rule mt-2 mx-auto w-40" />
        </blockquote>

        <p className="text-xs sm:text-sm text-[var(--mist)] leading-relaxed max-w-2xl mx-auto">
          In Tsukuyomi&apos;s sanctuary, celestial dedication is recorded and commemorated. Accomplish nocturnal missions, climb the samurai leaderboard, and exchange accumulated honor points for exclusive discounts and free subscription passes.
        </p>
      </div>

      {/* 2. Beautiful Astronomical Photo Card & Stargazer Telemetry Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[rgba(11,18,32,0.92)] shadow-[0_0_40px_rgba(0,0,0,0.85)]">
        <div className="grid lg:grid-cols-[1.3fr_1fr] items-center">
          {/* Astronomical Photograph */}
          <div className="relative h-72 sm:h-80 lg:h-96 w-full overflow-hidden group">
            <Image
              src="/images/astronomical-nebula.jpg"
              alt="Ultra-high-definition astronomical photo of a deep space cosmic nebula and star cluster"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition duration-700 group-hover:scale-105"
            />
            {/* Dark gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[rgba(11,18,32,0.92)]" />

            {/* Photo Telemetry Badge */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto rounded-md bg-[rgba(5,7,13,0.85)] border border-[var(--border)] p-2.5 backdrop-blur-md text-[11px] space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[var(--gold)]">✦</span>
                <span className="font-semibold text-[var(--moonlight)]">
                  Lagoon & Carina Deep-Space Nebula Complex
                </span>
                <span className="rounded-xs bg-[var(--crimson)] px-1.5 py-0.2 text-[9px] text-white uppercase font-mono">
                  Deep Sky
                </span>
              </div>
              <p className="text-[10px] text-[var(--mist)]">
                4,100 Light Years · Tsukuyomi Optical Observatory Survey · Bortle Class 1
              </p>
            </div>
          </div>

          {/* Interactive User Honor Status & Live Night-Watch Action */}
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold)] font-medium">
                ⚔️ Current Stargazer Standing
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)] mt-1">
                {user.name}
              </h3>
              <p className="text-xs text-[var(--mist)]">
                {user.title} · <span className="text-[var(--crimson-bright)] font-medium">{user.rank}</span>
              </p>
            </div>

            {/* Points Gauge Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--mist)]">Current Celestial Honor:</span>
                <span className="font-mono text-base font-bold text-[var(--gold-soft)]">
                  {user.honorPoints} Points
                </span>
              </div>

              {/* Progress Bar towards 1,000 Points Free Samurai Milestone */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgba(5,7,13,0.9)] border border-[var(--border)] p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--crimson)] via-[var(--gold)] to-[var(--crimson-bright)] transition-all duration-500 shadow-[0_0_10px_rgba(196,163,90,0.6)]"
                  style={{ width: `${Math.min(100, Math.max(8, (user.honorPoints / 1500) * 100))}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[var(--mist)]">
                <span>0 pts (Ronin)</span>
                <span>500 pts (25% Off)</span>
                <span>1000 pts (Free Samurai)</span>
                <span>1500 pts (50% Off)</span>
              </div>
            </div>

            {/* Quick Interactive Night Watcher Action */}
            <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="block text-xs font-semibold text-[var(--moonlight)]">
                  Active Sky Vigil
                </span>
                <span className="text-[11px] text-[var(--mist)]">
                  Log tonight&apos;s celestial gazing session
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogNightWatch}
                disabled={simulatedNightWatched}
                className="rounded-md bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--void)] shadow-[0_0_15px_rgba(196,163,90,0.4)] transition hover:brightness-110 active:scale-95 disabled:opacity-60"
              >
                {simulatedNightWatched ? "✓ Night Logged (+30 pts)" : "🌙 Log Night Watch (+30 pts)"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Subsections Navigation (3 Tabs: Ranks, Missions, Discounts) */}
      <div className="flex rounded-lg border border-[var(--border)] bg-[rgba(5,7,13,0.85)] p-1.5 text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("ranks")}
          className={`flex-1 py-2.5 sm:py-3 rounded-md font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === "ranks"
              ? "bg-[var(--gold)] text-[var(--void)] shadow-[0_0_15px_rgba(196,163,90,0.4)]"
              : "text-[var(--mist)] hover:text-[var(--moonlight)] hover:bg-[rgba(196,163,90,0.06)]"
          }`}
        >
          <span>🏆</span>
          <span>Ranks (Leaderboard)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("missions")}
          className={`flex-1 py-2.5 sm:py-3 rounded-md font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === "missions"
              ? "bg-[var(--gold)] text-[var(--void)] shadow-[0_0_15px_rgba(196,163,90,0.4)]"
              : "text-[var(--mist)] hover:text-[var(--moonlight)] hover:bg-[rgba(196,163,90,0.06)]"
          }`}
        >
          <span>📜</span>
          <span>Celestial Missions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("discounts")}
          className={`flex-1 py-2.5 sm:py-3 rounded-md font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === "discounts"
              ? "bg-[var(--crimson)] text-white shadow-[0_0_15px_rgba(196,69,77,0.5)]"
              : "text-[var(--mist)] hover:text-[var(--moonlight)] hover:bg-[rgba(196,163,90,0.06)]"
          }`}
        >
          <span>🎁</span>
          <span>Discounts & Rewards</span>
        </button>
      </div>

      {/* Subsection 1: RANKS (LEADERBOARD) */}
      {activeTab === "ranks" && (
        <div className="space-y-6 animate-fade-up">
          <CelestialGlowCard glowColor="gold" className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[var(--gold)] font-medium">
                  ⛩️ 番付表 · NOCTURNAL STANDINGS
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)] mt-0.5">
                  Tsukuyomi Celestial Stargazer Leaderboard
                </h3>
              </div>
              <span className="text-xs text-[var(--mist)]">Updated in Real-Time</span>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--mist)]">
                    <th className="pb-3 pl-3">Rank</th>
                    <th className="pb-3">Stargazer</th>
                    <th className="pb-3">Rank Title</th>
                    <th className="pb-3 text-center">Nights Watched</th>
                    <th className="pb-3 text-right">Honor Points</th>
                    <th className="pb-3 pr-3 text-right">Tier Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/40 font-mono">
                  {leaderboardEntries.map((row) => (
                    <tr
                      key={row.name}
                      className={`transition ${
                        row.isUser
                          ? "bg-[rgba(196,163,90,0.14)] font-semibold text-[var(--gold-soft)] ring-1 ring-[var(--gold)]"
                          : "text-[var(--moonlight)] hover:bg-[rgba(232,238,248,0.03)]"
                      }`}
                    >
                      <td className="py-3.5 pl-3">
                        {row.rank === 1 ? (
                          <span className="text-base text-yellow-400">🥇 #1</span>
                        ) : row.rank === 2 ? (
                          <span className="text-base text-gray-300">🥈 #2</span>
                        ) : row.rank === 3 ? (
                          <span className="text-base text-amber-600">🥉 #3</span>
                        ) : (
                          <span className="text-xs text-[var(--mist)]">#{row.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 font-sans font-medium">
                        <div className="flex items-center gap-2">
                          <span>{row.name}</span>
                          {row.isUser && (
                            <span className="rounded-full bg-[var(--gold)] px-2 py-0.5 text-[10px] text-[var(--void)] font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--mist)] block font-mono">{row.base}</span>
                      </td>
                      <td className="py-3.5 font-sans text-xs text-[var(--mist)]">{row.title}</td>
                      <td className="py-3.5 text-center text-xs">{row.nights} nights</td>
                      <td className="py-3.5 text-right font-bold text-sm text-[var(--gold)]">
                        {row.points} pts
                      </td>
                      <td className="py-3.5 pr-3 text-right font-sans text-[11px]">
                        <span className="rounded-full bg-[rgba(196,163,90,0.15)] border border-[var(--border)] px-2.5 py-1 text-[var(--gold-soft)]">
                          {row.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-xs text-[var(--mist)]">
              <span>Your position reflects real-time observation history & completed missions.</span>
              <button
                type="button"
                onClick={handleLogNightWatch}
                className="text-[var(--gold-soft)] hover:underline"
              >
                Log another night watch →
              </button>
            </div>
          </CelestialGlowCard>
        </div>
      )}

      {/* Subsection 2: MISSIONS (QUESTS) */}
      {activeTab === "missions" && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[var(--gold)] font-medium">
                📜 任務の巻物 · CELESTIAL QUESTS
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)] mt-0.5">
                Stargazing Missions & Nocturnal Tasks
              </h3>
            </div>
            <span className="text-xs text-[var(--mist)]">
              Complete quests to earn Honor Points & unlock subscription discounts
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MISSIONS.map((m) => {
              const isDone = user.completedMissions?.includes(m.id);
              return (
                <CelestialGlowCard
                  key={m.id}
                  glowColor={isDone ? "cyan" : "gold"}
                  className={`p-5 flex flex-col justify-between ${
                    isDone ? "border-[var(--success)] bg-[rgba(61,122,95,0.06)]" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{m.icon}</span>
                      <span className="font-serif text-sm text-[var(--crimson-bright)]">{m.kanji}</span>
                    </div>

                    <h4 className="font-[family-name:var(--font-display)] text-lg text-[var(--gold-soft)] mt-2">
                      {m.title}
                    </h4>
                    <p className="mt-1 text-xs text-[var(--mist)] leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] uppercase text-[var(--mist)]">Bounty</span>
                      <span className="font-mono text-sm font-bold text-[var(--gold)]">
                        +{m.points} pts
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClaimMission(m)}
                      disabled={isDone}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        isDone
                          ? "bg-[rgba(61,122,95,0.25)] border border-[var(--success)] text-[var(--success)] cursor-default"
                          : "bg-[var(--crimson)] text-white hover:bg-[var(--crimson-bright)] shadow-[0_0_10px_rgba(196,69,77,0.4)] active:scale-95"
                      }`}
                    >
                      {isDone ? "✓ Claimed" : `Claim Reward →`}
                    </button>
                  </div>
                </CelestialGlowCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Subsection 3: DISCOUNTS ON SPECIFIC POINTS (1000, 500, etc.) */}
      {activeTab === "discounts" && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[var(--gold)] font-medium">
                🎁 恩恵の印 · POINT DISCOUNTS & MERITS
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)] mt-0.5">
                Redeem Discounts on Specific Points
              </h3>
            </div>
            <div className="text-xs text-[var(--gold-soft)] font-mono">
              Available Balance: <strong className="text-base text-[var(--gold)]">{user.honorPoints} pts</strong>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {DISCOUNT_TIERS.map((tier) => {
              const hasEnough = user.honorPoints >= tier.pointsRequired;
              const isRevealed = revealedCodes[tier.code] || user.redeemedDiscounts?.includes(tier.code);

              return (
                <CelestialGlowCard
                  key={tier.code}
                  glowColor={hasEnough ? "gold" : "crimson"}
                  className={`p-6 flex flex-col justify-between ${
                    hasEnough ? "ring-1 ring-[var(--gold)] shadow-[0_0_20px_rgba(196,163,90,0.15)]" : "opacity-90"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg text-[var(--crimson-bright)] font-bold">
                            {tier.kanji}
                          </span>
                          <h4 className="font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)]">
                            {tier.title}
                          </h4>
                        </div>
                        <p className="mt-1 text-xs text-[var(--mist)]">{tier.description}</p>
                      </div>

                      <span className="rounded-full bg-gradient-to-r from-[var(--crimson)] to-[var(--crimson-bright)] px-3 py-1 text-xs font-bold text-white shadow-[0_0_10px_rgba(196,69,77,0.6)]">
                        {tier.discountBadge}
                      </span>
                    </div>

                    {/* Merits and Point Requirement */}
                    <div className="my-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--mist)]">Points Required:</span>
                        <span className="font-mono text-sm font-bold text-[var(--gold)]">
                          {tier.pointsRequired} Points
                        </span>
                      </div>

                      <div className="rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.7)] p-2.5 text-xs text-[var(--moonlight)]">
                        <span className="text-[var(--gold)] mr-1">✦</span>
                        {tier.perkHighlight}
                      </div>
                    </div>
                  </div>

                  {/* Redeem Button / Code Box */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)]">
                    {isRevealed ? (
                      <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--gold)] bg-[rgba(196,163,90,0.15)] p-2.5">
                        <div className="min-w-0">
                          <span className="block text-[10px] uppercase text-[var(--mist)]">Discount Code</span>
                          <span className="font-mono text-base font-bold text-[var(--gold-soft)] tracking-wider">
                            {tier.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(tier.code);
                            setToastMsg(`Code ${tier.code} copied!`);
                          }}
                          className="rounded-sm bg-[var(--gold)] px-3 py-1.5 text-xs font-bold text-[var(--void)] hover:bg-[var(--gold-soft)] transition"
                        >
                          Copy Code 📋
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRedeemDiscount(tier)}
                        disabled={!hasEnough}
                        className={`w-full rounded-md py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                          hasEnough
                            ? "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] text-[var(--void)] hover:brightness-110 shadow-[0_0_15px_rgba(196,163,90,0.4)] active:scale-95"
                            : "border border-[var(--border)] bg-[rgba(5,7,13,0.6)] text-[var(--mist)] cursor-not-allowed"
                        }`}
                      >
                        {hasEnough
                          ? `Redeem for ${tier.pointsRequired} Points →`
                          : `Need ${tier.pointsRequired - user.honorPoints} more points to unlock`}
                      </button>
                    )}
                  </div>
                </CelestialGlowCard>
              );
            })}
          </div>
        </div>
      )}

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} tone="success" />
    </section>
  );
}

