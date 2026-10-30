"use client";

import React, { useState } from "react";
import { ComparisonSlider } from "@/components/spirit-lens/ComparisonSlider";

interface SpiritLensDemoSectionProps {
  onLoadSample?: (targetKey?: string) => void;
  isLoadingSample?: boolean;
}

const DEMO_TARGETS = [
  {
    key: "orion",
    title: "Orion & Running Man Nebula (M42 / NGC 1977)",
    kanji: "オリオン大星雲",
    beforeUrl: "/images/spirit-lens-realistic-before.jpg",
    afterUrl: "/images/spirit-lens-realistic-after.jpg",
    optics: "Telescope: 8\" F/4 Newtonian Astrograph · Cooled CMOS 14-bit Sensor · 120s sub-exposure",
    beforeNote: "Raw uncalibrated CMOS frame showing sensor thermal noise, sky glow background, and seeing blur.",
    afterNote: "Deconvolved AI restoration with background gradient removal, pinpoint star cores, and Hydrogen-alpha emission.",
  },
  {
    key: "lagoon",
    title: "Lagoon & Star Cluster Complex (NGC 6523)",
    kanji: "干潟星雲",
    beforeUrl: "/images/spirit-lens-before.jpg",
    afterUrl: "/images/spirit-lens-after.jpg",
    optics: "Telescope: 102mm Triplet Refractor · Dual Narrowband Ha/OIII Filter · Bortle Class 3",
    beforeNote: "Muted raw stack prior to non-linear dynamic range stretch.",
    afterNote: "Non-linear adaptive stretch revealing delicate interstellar dust lanes and ionized hydrogen gas.",
  },
];

export function SpiritLensDemoSection({
  onLoadSample,
  isLoadingSample = false,
}: SpiritLensDemoSectionProps) {
  const [selectedTarget, setSelectedTarget] = useState(0);
  const target = DEMO_TARGETS[selectedTarget];

  return (
      <section className="ink-panel rounded-xl p-5 sm:p-6 border border-[var(--border-strong)] shadow-2xl space-y-5 animate-fade-up">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <span className="font-serif text-sm text-[var(--crimson-bright)]">
                {target.kanji}
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)]">
                Authentic Astrophotography: Before vs After
              </h2>
            </div>
            <p className="mt-1 text-xs text-[var(--mist)] leading-relaxed">
              Realistic telescope sensor comparison. Slide the golden divider left and right to inspect raw optical sensor capture vs AI deconvolution and background extraction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onLoadSample && (
              <button
                type="button"
                onClick={() => onLoadSample(target.key)}
                disabled={isLoadingSample}
                className="rounded-md bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[var(--void)] shadow-[0_0_15px_rgba(196,163,90,0.4)] transition hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {isLoadingSample ? "Loading Target…" : "⚡ Load Into Lens Workbench →"}
              </button>
            )}
          </div>
        </div>

        {/* Target Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-[var(--mist)]">Telescope Targets:</span>
          {DEMO_TARGETS.map((t, idx) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSelectedTarget(idx)}
              className={`rounded-md border px-3 py-1.5 transition flex items-center gap-1.5 ${selectedTarget === idx
                  ? "border-[var(--gold)] bg-[rgba(196,163,90,0.18)] text-[var(--gold-soft)] font-semibold shadow-[0_0_10px_rgba(196,163,90,0.2)]"
                  : "border-[var(--border)] bg-[rgba(5,7,13,0.5)] text-[var(--mist)] hover:text-[var(--moonlight)]"
                }`}
            >
              <span>🔭</span>
              <span>{t.title}</span>
            </button>
          ))}
        </div>

        {/* Optics Telemetry Badge */}
        <div className="rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.6)] px-3 py-2 text-[11px] font-mono text-[var(--gold-soft)] flex flex-wrap items-center justify-between gap-2">
          <span>{target.optics}</span>
          <span className="text-[10px] text-[var(--mist)] uppercase">Photographic Realism</span>
        </div>

        {/* Interactive Before vs After Comparison Slider */}
        <div className="space-y-3">
          <ComparisonSlider
            originalUrl={target.beforeUrl}
            restoredUrl={target.afterUrl}
            labelRestored="Processed & AI Deconvolved"
          />

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[var(--mist)] px-1">
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--gold)]">◀</span>
              <span>Slide left to inspect <strong>APOD-Quality Processed Frame</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>Slide right to inspect <strong>Raw Single-Exposure Noise</strong></span>
              <span className="text-[var(--gold)]">▶</span>
            </span>
          </div>
        </div>

          {/* Technical Breakdown Cards */}
          <div className="grid gap-3 sm:grid-cols-3 pt-1">
            <div className="rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.6)] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-soft)]">
                <span>🌟</span>
                <span>Realistic Star Deconvolution</span>
              </div>
              <p className="text-[11px] text-[var(--mist)] leading-relaxed">
                Deconvolves atmospheric seeing disk blur into tight, natural stellar cores without artificial artifacts or cartoon outlines.
              </p>
            </div>

            <div className="rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.6)] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-soft)]">
                <span>🌌</span>
                <span>Dynamic Background Extraction</span>
              </div>
              <p className="text-[11px] text-[var(--mist)] leading-relaxed">
                Neutralizes urban sky background gradient and preserves true Hydrogen-alpha (656 nm) deep crimson and Oxygen-III teal emissions.
              </p>
            </div>

            <div className="rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.6)] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-soft)]">
                <span>🔬</span>
                <span>CMOS Poisson Denoising</span>
              </div>
              <p className="text-[11px] text-[var(--mist)] leading-relaxed">
                Filters stochastic read-noise and dark current while retaining micro-luminance structures of faint background dust clouds.
              </p>
            </div>
          </div>
      </section>
      );
}
