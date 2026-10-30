"use client";

import React, { useState } from "react";

type CelestialGlowCardProps = {
  children: React.ReactNode;
  className?: string;
  glowColor?: "gold" | "crimson" | "cyan";
  sparkleCount?: number;
};

export function CelestialGlowCard({
  children,
  className = "",
  glowColor = "gold",
}: CelestialGlowCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const glowShadow =
    glowColor === "crimson"
      ? "shadow-[0_0_25px_rgba(196,69,77,0.35),inset_0_0_12px_rgba(196,69,77,0.15)] border-[var(--crimson-bright)]"
      : glowColor === "cyan"
        ? "shadow-[0_0_25px_rgba(100,200,255,0.35),inset_0_0_12px_rgba(100,200,255,0.15)] border-[#70c0ff]"
        : "shadow-[0_0_30px_rgba(196,163,90,0.4),inset_0_0_15px_rgba(196,163,90,0.12)] border-[var(--gold)]";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group transition-all duration-300 rounded-md border ${
        isHovered
          ? `${glowShadow} bg-[rgba(18,26,43,0.96)]`
          : "border-[var(--border)] bg-[var(--panel)]"
      } ${className}`}
    >
      {/* Corner Sparkle Stars when Hovered */}
      {isHovered && (
        <>
          {/* Top-Left Star */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-2.5 -left-2.5 z-30 select-none text-xs text-[var(--gold-soft)] animate-spin-slow transition-transform scale-110"
            style={{ filter: "drop-shadow(0 0 6px #c4a35a)" }}
          >
            ✦
          </span>

          {/* Top-Right Star */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-2.5 -right-2.5 z-30 select-none text-sm text-[var(--gold)] animate-pulse transition-transform scale-125"
            style={{ filter: "drop-shadow(0 0 8px #e0c987)" }}
          >
            ★
          </span>

          {/* Bottom-Left Star */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 -left-2 z-30 select-none text-[10px] text-[var(--crimson-bright)] animate-pulse"
            style={{ filter: "drop-shadow(0 0 6px #c4454d)" }}
          >
            ✧
          </span>

          {/* Bottom-Right Star */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2.5 -right-2.5 z-30 select-none text-xs text-[var(--gold-soft)] animate-spin-slow"
            style={{ filter: "drop-shadow(0 0 6px #c4a35a)" }}
          >
            ✦
          </span>

          {/* Mid-Border Sparkles */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 -left-1.5 -translate-y-1/2 z-30 select-none text-[9px] text-[var(--gold)] animate-ping"
          >
            ·
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 -right-1.5 -translate-y-1/2 z-30 select-none text-[9px] text-[var(--gold)] animate-ping"
          >
            ·
          </span>

          {/* Starlight Ambient Sweep Aura */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 rounded-md bg-[radial-gradient(ellipse_at_50%_0%,rgba(196,163,90,0.12),transparent_70%)]"
          />
        </>
      )}

      {/* Card Content */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

