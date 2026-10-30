"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, continueAsGuest } = useAuth();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(name || "Samurai Stargazer", email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-up">
      <div className="relative w-full max-w-md overflow-hidden rounded-md border border-[var(--border-strong)] bg-[var(--midnight)] p-6 shadow-2xl">
        {/* Japanese Top Ribbon Motif */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--crimson)] via-[var(--gold)] to-[var(--crimson)]" />
        
        {/* Close button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-sm text-[var(--mist)] hover:text-[var(--gold-soft)]"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mt-2">
          <span className="text-xl">🌸</span>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)]">
            {tab === "signin" ? "Enter the Dojo" : "Join the Celestial Clan"}
          </h2>
          <p className="mt-1 text-xs text-[var(--mist)]">
            Access your stargazing honor points, saved dark-sky sites & image restorations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="mt-5 flex border-b border-[var(--border)] text-sm">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 pb-2 text-center transition ${
              tab === "signin"
                ? "border-b-2 border-[var(--gold)] font-medium text-[var(--gold-soft)]"
                : "text-[var(--mist)] hover:text-[var(--moonlight)]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 pb-2 text-center transition ${
              tab === "register"
                ? "border-b-2 border-[var(--gold)] font-medium text-[var(--gold-soft)]"
                : "text-[var(--mist)] hover:text-[var(--moonlight)]"
            }`}
          >
            Create Scroll
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {tab === "register" && (
            <div>
              <label className="text-xs text-[var(--mist)]">Samurai Callsign / Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Musashi / Vineet"
                required
                className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-3 py-2 text-sm text-[var(--moonlight)] outline-none focus:border-[var(--gold)]"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-[var(--mist)]">
              {tab === "signin" ? "Callsign or Email" : "Scroll Email"}
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="stargazer@samurai.io"
              required
              className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-3 py-2 text-sm text-[var(--moonlight)] outline-none focus:border-[var(--gold)]"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--mist)]">Secret Cipher (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.7)] px-3 py-2 text-sm text-[var(--moonlight)] outline-none focus:border-[var(--gold)]"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-sm bg-[var(--crimson)] py-2.5 text-sm font-medium text-[var(--moonlight)] transition hover:bg-[var(--crimson-bright)]"
          >
            {tab === "signin" ? "Sign In to the Clan" : "Enroll as Celestial Samurai"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-[var(--border)]" />
          <span className="relative bg-[var(--midnight)] px-3 text-xs text-[var(--mist)]">
            or explore freely
          </span>
        </div>

        {/* Guest Mode Button */}
        <button
          type="button"
          onClick={continueAsGuest}
          className="w-full rounded-sm border border-[var(--border-strong)] bg-[rgba(196,163,90,0.06)] py-2 text-sm text-[var(--gold-soft)] transition hover:bg-[rgba(196,163,90,0.15)] hover:border-[var(--gold)]"
        >
          🗡️ Continue in Guest Mode (浪人 Ronin)
        </button>

        <p className="mt-3 text-center text-[10px] text-[var(--mist)]">
          Guest mode gives you immediate access to all 4 celestial modules without an account.
        </p>
      </div>
    </div>
  );
}

