"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth/auth-context";

export function SamuraiLoginPage() {
  const { hasEnteredDojo, isLoginGateOpen, login, continueAsGuest, closeLoginGate } = useAuth();

  const [tab, setTab] = useState<"signin" | "signup" | "guest">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already entered and gate is not explicitly opened, do not show
  if (hasEnteredDojo && !isLoginGateOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (tab === "signin") {
      if (!email.trim() || !password.trim()) {
        setErrorMsg("Please enter both email and secret cipher.");
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        login(name || email.split("@")[0] || "Samurai Stargazer", email);
        setIsSubmitting(false);
      }, 350);
    } else if (tab === "signup") {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg("Please provide your samurai callsign, email, and password.");
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        login(name.trim(), email.trim());
        setIsSubmitting(false);
      }, 350);
    }
  };

  const fillDemo = () => {
    setEmail("musashi@tsukuyomi.io");
    setPassword("samurai2026");
    setName("Miyamoto Musashi");
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4 sm:p-6 bg-[#05070d]">
      {/* 1. Dramatic Samurai Standing in Moonlight Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/samurai-moonlight.jpg"
          alt="Samurai standing in moonlight under a glowing full moon and starry sky"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transform scale-105 animate-pulse-soft"
          style={{ animationDuration: "12s" }}
        />

        {/* Deep atmospheric gradient overlay for readability and cinematic drama */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-[rgba(5,7,13,0.72)] to-[rgba(5,7,13,0.55)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_20%,rgba(5,7,13,0.85)_80%)]" />

        {/* Drifting subtle moonlight aurora glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(196,163,90,0.18)_0%,rgba(77,168,218,0.12)_40%,transparent_75%)] blur-3xl pointer-events-none" />

        {/* Floating starlight sparkles */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 20% 25%, #fff, transparent),
              radial-gradient(2px 2px at 35% 65%, #c4a35a, transparent),
              radial-gradient(1.5px 1.5px at 65% 18%, #e8eef8, transparent),
              radial-gradient(2px 2px at 80% 45%, #70c0ff, transparent),
              radial-gradient(1.5px 1.5px at 15% 85%, #c4a35a, transparent),
              radial-gradient(1px 1px at 88% 85%, #fff, transparent)
            `,
          }}
        />
      </div>

      {/* 2. Glassmorphic Japanese Celestial Login Card */}
      <div className="relative z-10 w-full max-w-md my-auto overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[rgba(11,18,32,0.88)] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_25px_rgba(196,163,90,0.22)] backdrop-blur-xl animate-fade-up">
        {/* Top Japanese Crimson & Gold Ornamental Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--crimson)] via-[var(--gold)] to-[var(--crimson)]" />

        {/* Optional dismiss button if user already had a session */}
        {hasEnteredDojo && (
          <button
            type="button"
            onClick={closeLoginGate}
            className="absolute top-4 right-4 text-xs text-[var(--mist)] hover:text-[var(--gold-soft)]"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        {/* Header with Japanese Emblem */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--gold)] bg-[rgba(196,163,90,0.1)] text-2xl text-[var(--gold-soft)] shadow-[0_0_15px_rgba(196,163,90,0.35)]">
            ⛩️
          </div>
          <span className="mt-2.5 inline-block text-[10px] font-medium uppercase tracking-[0.35em] text-[var(--gold)]">
            月読の聖域 · CELESTIAL GATEWAY
          </span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-semibold tracking-wide text-[var(--moonlight)]">
            Enter Tsukuyomi Watch
          </h1>
          <p className="mt-1 text-xs text-[var(--mist)] leading-relaxed">
            The Samurai&apos;s guide to stargazing conditions, dark-sky tracking & astronomical exploration.
          </p>
        </div>

        {/* Tab Switcher: Sign In | Sign Up | Guest */}
        <div className="mt-5 grid grid-cols-3 gap-1 rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.85)] p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setErrorMsg(null);
            }}
            className={`rounded-sm py-1.5 font-medium transition ${
              tab === "signin"
                ? "bg-[var(--gold)] text-[var(--void)] font-bold shadow-[0_0_8px_rgba(196,163,90,0.4)]"
                : "text-[var(--mist)] hover:text-[var(--moonlight)]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setErrorMsg(null);
            }}
            className={`rounded-sm py-1.5 font-medium transition ${
              tab === "signup"
                ? "bg-[var(--gold)] text-[var(--void)] font-bold shadow-[0_0_8px_rgba(196,163,90,0.4)]"
                : "text-[var(--mist)] hover:text-[var(--moonlight)]"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("guest");
              setErrorMsg(null);
            }}
            className={`rounded-sm py-1.5 font-medium transition ${
              tab === "guest"
                ? "bg-[var(--crimson)] text-white font-bold shadow-[0_0_8px_rgba(196,69,77,0.5)]"
                : "text-[var(--mist)] hover:text-[var(--moonlight)]"
            }`}
          >
            🗡️ Guest
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-3 rounded-sm border border-[var(--danger)] bg-[rgba(163,59,59,0.2)] p-2 text-center text-xs text-[#ff9e9e]">
            {errorMsg}
          </div>
        )}

        {/* Tab Content 1: Sign In & Sign Up Form */}
        {tab !== "guest" ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {tab === "signup" && (
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--mist)]">
                  Samurai Callsign / Name
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-[var(--gold)]">
                    ⚔️
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Miyamoto Musashi"
                    required
                    className="w-full rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.7)] py-2.5 pl-9 pr-3 text-xs text-[var(--moonlight)] placeholder:text-[var(--mist)]/50 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--mist)]">
                Stargazing Email Address
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-[var(--gold)]">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="stargazer@tsukuyomi.io"
                  required
                  className="w-full rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.7)] py-2.5 pl-9 pr-3 text-xs text-[var(--moonlight)] placeholder:text-[var(--mist)]/50 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--mist)]">
                  Secret Cipher (Password)
                </label>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-[10px] text-[var(--gold)] hover:underline"
                >
                  Fill Demo Cipher
                </button>
              </div>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-[var(--gold)]">
                  🔒
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-md border border-[var(--border)] bg-[rgba(5,7,13,0.7)] py-2.5 pl-9 pr-3 text-xs text-[var(--moonlight)] placeholder:text-[var(--mist)]/50 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--mist)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--border)] bg-[rgba(5,7,13,0.8)] text-[var(--gold)] focus:ring-0"
                />
                <span>Remember my celestial scroll</span>
              </label>
              <button
                type="button"
                onClick={fillDemo}
                className="text-[var(--gold-soft)] hover:underline"
              >
                Demo credentials?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-md bg-[var(--crimson)] py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(196,69,77,0.5)] transition hover:bg-[var(--crimson-bright)] hover:shadow-[0_0_20px_rgba(196,69,77,0.7)] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting
                ? "Attuning Starlight…"
                : tab === "signin"
                  ? "Sign In to the Clan →"
                  : "Create Account & Join Guild →"}
            </button>
          </form>
        ) : (
          /* Tab Content 2: Enter as Guest Option */
          <div className="mt-5 space-y-4 text-center">
            <div className="rounded-lg border border-[var(--border)] bg-[rgba(5,7,13,0.6)] p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-soft)]">
                <span className="text-base">🗡️</span>
                <span>The Ronin&apos;s Unrestricted Path (浪人)</span>
              </div>
              <p className="text-xs text-[var(--mist)] leading-relaxed">
                Step directly into the sanctuary as a roaming stargazing wanderer. Zero email or password required.
              </p>
              <ul className="text-[11px] text-[var(--moonlight)] space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-[var(--gold)]">✦</span> Full Live Weather & Night Honor Score
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[var(--gold)]">✦</span> Meteor Showers, ISS & Moon Phase Calculations
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[var(--gold)]">✦</span> Spirit Lens AI Astro Photo Restoration
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full rounded-md bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--void)] shadow-[0_0_20px_rgba(196,163,90,0.5)] transition hover:brightness-110 active:scale-[0.99]"
            >
              Enter Instantly as Guest →
            </button>
          </div>
        )}

        {/* Divider & Guest Quick-Action if on Sign In / Up */}
        {tab !== "guest" && (
          <div className="mt-5">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-[var(--border)]" />
              <span className="relative bg-[rgba(11,18,32,0.95)] px-3 text-[10px] uppercase tracking-wider text-[var(--mist)]">
                or continue without an account
              </span>
            </div>

            <button
              type="button"
              onClick={continueAsGuest}
              className="mt-3.5 w-full rounded-md border border-[var(--border)] bg-[rgba(196,163,90,0.06)] py-2 text-xs font-medium text-[var(--gold-soft)] transition hover:bg-[rgba(196,163,90,0.16)] hover:border-[var(--gold)]"
            >
              🗡️ Enter as Guest (Ronin Mode)
            </button>
          </div>
        )}

        {/* Footer Note */}
        <p className="mt-4 text-center text-[10px] text-[var(--mist)]/70">
          Tsukuyomi Watch preserves honor and privacy. Sessions are securely held in local browser memory.
        </p>
      </div>
    </div>
  );
}

