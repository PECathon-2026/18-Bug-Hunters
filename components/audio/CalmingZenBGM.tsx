"use client";

import React, { useState, useEffect } from "react";
import { zenBgmEngine } from "@/lib/audio/zen-soundscape";

interface CalmingZenBGMProps {
  showLabel?: boolean;
  className?: string;
}

export function CalmingZenBGM({ showLabel = false, className = "" }: CalmingZenBGMProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsPlaying(zenBgmEngine.getStatus());
  }, []);

  const toggleBgm = async () => {
    if (isPlaying) {
      zenBgmEngine.stop();
      setIsPlaying(false);
    } else {
      const ok = await zenBgmEngine.start();
      if (ok) setIsPlaying(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleBgm}
      title={isPlaying ? "Mute Calming Zen BGM (Playing)" : "Play Calming Zen Sanctuary Music (Muted)"}
      aria-label="Toggle Calming Background Music"
      className={`relative inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[rgba(18,26,43,0.6)] px-2.5 py-1.5 text-xs text-[var(--moonlight)] transition-all duration-300 hover:border-[var(--gold)] hover:bg-[rgba(196,163,90,0.12)] active:scale-95 ${className}`}
    >
      {/* Icon with animated equalizer bars when playing */}
      <span className="text-sm">
        {isPlaying ? "🎵" : "🔇"}
      </span>

      {isPlaying && (
        <span className="flex items-end gap-0.5 h-3 w-3">
          <span className="w-0.5 bg-[var(--gold)] rounded-full animate-pulse" style={{ height: "60%" }} />
          <span className="w-0.5 bg-[var(--gold-soft)] rounded-full animate-pulse" style={{ height: "100%", animationDelay: "150ms" }} />
          <span className="w-0.5 bg-[var(--gold)] rounded-full animate-pulse" style={{ height: "40%", animationDelay: "300ms" }} />
        </span>
      )}

      {showLabel && (
        <span className="font-medium text-[11px] tracking-wide">
          {isPlaying ? "Zen Music: Playing" : "Zen Music: Muted"}
        </span>
      )}

      {/* Subtle indicator dot */}
      <span
        className={`h-2 w-2 rounded-full transition-colors duration-300 ${
          isPlaying
            ? "bg-[var(--success)] shadow-[0_0_8px_var(--success)]"
            : "bg-[var(--mist)]/40"
        }`}
      />
    </button>
  );
}

