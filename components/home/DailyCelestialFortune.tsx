"use client";

import React, { useState } from "react";
import { CelestialGlowCard } from "@/components/ui/CelestialGlowCard";

interface FortuneCard {
  level: string;
  kanji: string;
  haiku: string;
  meaning: string;
  luckyConstellation: string;
  auspiciousDirection: string;
  honorBlessing: string;
}

const FORTUNES: FortuneCard[] = [
  {
    level: "Great Celestial Blessing (大吉 Daikichi)",
    kanji: "大吉",
    haiku: "澄む夜空 · 刃に映る · 北極星 (Clear autumn night sky; on the samurai's keen blade, shines the Polaris star)",
    meaning: "The atmospheric layers are still and crystal clear. Perfect seeing conditions await your optical lens tonight.",
    luckyConstellation: "Cygnus the Swan (白鳥座)",
    auspiciousDirection: "North-Northwest (335°)",
    honorBlessing: "+50 Celestial Clarity Bonus",
  },
  {
    level: "Ascending Moon Fortune (中吉 Chukichi)",
    kanji: "中吉",
    haiku: "雲の波 · 月を隠せど · 光あり (Waves of passing cloud; though they veil the silver moon, her radiance remains)",
    meaning: "Transient clouds may drift by, but patience will reward you with fleeting, brilliant observing windows.",
    luckyConstellation: "Orion the Hunter (オリオン座)",
    auspiciousDirection: "East-Southeast (110°)",
    honorBlessing: "+35 Perseverance Merit",
  },
  {
    level: "Nocturnal Starlight Vigil (小吉 Shokichi)",
    kanji: "小吉",
    haiku: "静寂に · 流れ星飛ぶ · 峰の風 (In profound silence; a streak of falling starlight, wind upon the peak)",
    meaning: "Keep your gaze turned upward. A surprise meteor or bright satellite flare is destined to cross your field of view.",
    luckyConstellation: "Cassiopeia the Queen (カシオペヤ座)",
    auspiciousDirection: "North-Northeast (025°)",
    honorBlessing: "+25 Skywatcher Honor",
  },
  {
    level: "Dojō Sanctuary Peace (吉 Kichi)",
    kanji: "吉",
    haiku: "星仰ぎ · 我が道知るや · 浪人よ (Gazing at the stars; do you perceive your destined path, wandering ronin?)",
    meaning: "A serene night for reflection and studying star charts. Tune your equipment for tomorrow's expedition.",
    luckyConstellation: "Taurus the Bull (おうし座)",
    auspiciousDirection: "Zenith (Direct Overhead)",
    honorBlessing: "+20 Zen Focus",
  },
];

export function DailyCelestialFortune() {
  const [fortuneIndex, setFortuneIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const drawFortune = () => {
    setIsDrawing(true);
    setTimeout(() => {
      const nextIdx = Math.floor(Math.random() * FORTUNES.length);
      setFortuneIndex(nextIdx);
      setIsDrawing(false);
      setHasDrawn(true);
    }, 450);
  };

  const f = FORTUNES[fortuneIndex];

  return (
    <CelestialGlowCard glowColor="gold" className="p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎋</span>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)] font-mono block">
              おみくじ · DAILY CELESTIAL PROVERB
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)]">
              Daily Stargazer Fortune & Sky Wisdom
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={drawFortune}
          disabled={isDrawing}
          className="rounded-md bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--void)] shadow-[0_0_12px_rgba(196,163,90,0.4)] transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {isDrawing ? "Consulting Stars…" : "🎋 Draw Celestial Fortune →"}
        </button>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[rgba(5,7,13,0.5)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[rgba(196,163,90,0.18)] border border-[var(--gold)] px-2.5 py-0.5 text-xs font-bold text-[var(--gold-soft)]">
            {f.level}
          </span>
          <span className="font-serif text-2xl text-[var(--crimson-bright)] font-bold">
            {f.kanji}
          </span>
        </div>

        <blockquote className="font-[family-name:var(--font-display)] text-base sm:text-lg text-[var(--moonlight)] italic leading-relaxed pl-3 border-l-2 border-[var(--gold)]">
          &ldquo;{f.haiku}&rdquo;
        </blockquote>

        <p className="text-xs text-[var(--mist)] leading-relaxed">
          {f.meaning}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[var(--border)]/40 text-[11px] font-mono">
          <div>
            <span className="text-[var(--mist)] block text-[10px] uppercase">Lucky Sign</span>
            <span className="text-[var(--gold-soft)]">{f.luckyConstellation}</span>
          </div>
          <div>
            <span className="text-[var(--mist)] block text-[10px] uppercase">Auspicious Bearing</span>
            <span className="text-[var(--moonlight)]">{f.auspiciousDirection}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[var(--mist)] block text-[10px] uppercase">Blessing</span>
            <span className="text-[var(--crimson-bright)]">{f.honorBlessing}</span>
          </div>
        </div>
      </div>
    </CelestialGlowCard>
  );
}

