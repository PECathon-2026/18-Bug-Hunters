"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export function ProfileButton() {
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const planBadge =
    user.plan === "shogun"
      ? { label: "将軍 Shogun", color: "bg-[var(--gold)] text-[var(--void)] font-bold shadow-[0_0_8px_#c4a35a]" }
      : user.plan === "samurai"
        ? { label: "侍 Samurai", color: "bg-[var(--crimson)] text-white font-medium" }
        : { label: "浪人 Free", color: "bg-[rgba(196,163,90,0.18)] text-[var(--gold-soft)]" };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-sm border border-[var(--border)] bg-[rgba(18,26,43,0.7)] px-2.5 py-1.5 text-xs text-[var(--moonlight)] transition hover:border-[var(--gold)] hover:bg-[rgba(196,163,90,0.08)]"
        aria-label="User Profile"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--crimson)] text-[10px] text-white font-serif">
          {user.plan === "shogun" ? "将" : user.plan === "samurai" ? "侍" : "浪"}
        </span>
        <span className="max-w-[100px] truncate text-left sm:max-w-none">
          {user.name}
        </span>
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${planBadge.color}`}>
          {planBadge.label}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md border border-[var(--border-strong)] bg-[var(--midnight)] p-4 shadow-2xl z-50 animate-fade-up">
          <div className="flex items-start gap-3 border-b border-[var(--border)] pb-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--torii)] text-base font-serif text-[var(--moonlight)] border border-[var(--gold)]">
              {user.plan === "shogun" ? "将" : user.plan === "samurai" ? "侍" : "浪"}
            </span>
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--gold-soft)] truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-[var(--mist)] truncate">
                {user.title}
              </p>
              <span className="mt-1 inline-block text-[10px] uppercase tracking-wider text-[var(--crimson-bright)] font-mono">
                {user.rank}
              </span>
            </div>
          </div>

          <div className="py-3 space-y-2 text-xs text-[var(--mist)]">
            <div className="flex justify-between">
              <span>Subscription Tier:</span>
              <span className="text-[var(--gold)] font-medium capitalize">
                {user.plan} Tier
              </span>
            </div>
            <div className="flex justify-between">
              <span>Honor Points:</span>
              <span className="font-mono text-[var(--gold)] font-medium">
                {user.honorPoints} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span>Observing Base:</span>
              <span className="text-[var(--moonlight)] truncate max-w-[120px]">
                {user.homeBase}
              </span>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-3 space-y-2">
            <Link
              href="/#subscription-plans"
              onClick={() => setIsOpen(false)}
              className="block text-center w-full rounded-sm border border-[var(--border)] py-1.5 text-xs text-[var(--gold-soft)] hover:bg-[rgba(196,163,90,0.1)] transition"
            >
              🏯 View Subscription Plans
            </Link>

            {!isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openAuthModal();
                }}
                className="w-full rounded-sm bg-[var(--crimson)] py-1.5 text-xs text-[var(--moonlight)] transition hover:bg-[var(--crimson-bright)]"
              >
                Sign In / Join Clan
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full rounded-sm border border-[var(--border)] py-1.5 text-xs text-[var(--mist)] transition hover:text-[var(--crimson-bright)] hover:border-[var(--crimson)]"
              >
                Sign Out (Return to Guest)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
