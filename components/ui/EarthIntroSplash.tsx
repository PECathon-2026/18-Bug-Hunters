"use client";

import { useEffect, useState } from "react";

export function EarthIntroSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const entered = sessionStorage.getItem("tsukuyomi_entered_session");
      const introPlayed = sessionStorage.getItem("tsukuyomi_intro_played");
      if (!entered) return true;
      return !introPlayed;
    } catch {
      return true;
    }
  });

  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // Begin fade-out at 2000ms (2 seconds)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 2000);

    // Completely unmount at 2500ms
    const hideTimer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("tsukuyomi_intro_played", "true");
      } catch {
        // ignore
      }
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05070d] transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Starfield Twinkling */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 15% 20%, #e8eef8, transparent),
            radial-gradient(2px 2px at 45% 15%, #c4a35a, transparent),
            radial-gradient(1.5px 1.5px at 75% 35%, #e8eef8, transparent),
            radial-gradient(2px 2px at 85% 70%, #c4a35a, transparent),
            radial-gradient(1.5px 1.5px at 25% 80%, #e8eef8, transparent),
            radial-gradient(1px 1px at 60% 85%, #e8eef8, transparent)
          `,
        }}
      />

      {/* Floating 3D Earth Animation Sphere */}
      <div className="relative flex items-center justify-center animate-earth-zoom">
        {/* Outer Deep Space Nebula Glow */}
        <div className="absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(77,168,218,0.35)_0%,rgba(143,45,58,0.2)_45%,transparent_70%)] animate-pulse" />

        {/* Outer Atmospheric Corona Ring */}
        <div className="absolute h-52 w-52 rounded-full border-2 border-[#70c0ff] shadow-[0_0_40px_rgba(77,168,218,0.9),inset_0_0_25px_rgba(77,168,218,0.5)]" />

        {/* Orbiting Moon around Earth in Intro */}
        <div
          className="absolute h-64 w-64 rounded-full border border-dashed border-[rgba(196,163,90,0.4)]"
          style={{ animation: "intro-moon-orbit 3s linear infinite" }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff,#b0bec5_60%,#37474f)] shadow-[0_0_10px_#fff]" />
        </div>

        {/* Rotating 3D Earth Globe */}
        <div
          className="relative h-44 w-44 overflow-hidden rounded-full shadow-[inset_-22px_-14px_30px_rgba(0,0,0,0.95),0_0_35px_rgba(77,168,218,0.7)]"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #5dbcd2 0%, #1e5f8a 45%, #0d2b45 75%, #05101a 100%)",
          }}
        >
          {/* Drifting Continents and Clouds */}
          <div
            className="absolute inset-0 opacity-85"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 30%, rgba(68,140,93,0.9) 26px, transparent 28px),
                radial-gradient(circle at 65% 45%, rgba(68,140,93,0.85) 35px, transparent 38px),
                radial-gradient(circle at 40% 75%, rgba(68,140,93,0.8) 28px, transparent 30px),
                radial-gradient(circle at 50% 25%, rgba(255,255,255,0.7) 14px, transparent 18px),
                radial-gradient(circle at 75% 65%, rgba(255,255,255,0.6) 18px, transparent 24px)
              `,
              animation: "intro-earth-spin 4s linear infinite",
            }}
          />

          {/* Shadow Terminator */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[rgba(5,7,13,0.9)]" />
        </div>
      </div>

      {/* Japanese Title & Inscription */}
      <div className="relative z-10 mt-6 text-center animate-fade-up">
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--gold)]">
          ⛩️ 月読の道 · EN ROUTE TO EARTH
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wider text-[var(--gold-soft)] sm:text-4xl">
          TSUKUYOMI WATCH
        </h1>
        <p className="mt-1 font-serif text-sm tracking-widest text-[var(--mist)]">
          The Samurai&apos;s Celestial Guide
        </p>

        {/* 2-Second Progress Bar */}
        <div className="mx-auto mt-4 h-1 w-48 overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--crimson)] via-[var(--gold)] to-[var(--crimson-bright)]"
            style={{ animation: "intro-progress 2s linear forwards" }}
          />
        </div>
      </div>

      {/* Skip button in corner */}
      <button
        type="button"
        onClick={() => {
          setFading(true);
          setTimeout(() => {
            setVisible(false);
            try {
              sessionStorage.setItem("tsukuyomi_intro_played", "true");
            } catch {
              // ignore
            }
          }, 300);
        }}
        className="absolute bottom-6 right-6 rounded-sm border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--mist)] hover:text-[var(--gold-soft)] hover:border-[var(--gold)]"
      >
        Skip Intro →
      </button>

      <style jsx>{`
        @keyframes intro-earth-spin {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }
        @keyframes intro-moon-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes intro-progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-earth-zoom {
          animation: earth-zoom 2s ease-out forwards;
        }
        @keyframes earth-zoom {
          0% {
            transform: scale(0.65);
            opacity: 0.2;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
