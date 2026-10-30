"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/lib/auth/auth-context";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const SIDEBAR_NAV_ITEMS = [
  {
    href: "/",
    label: "Dojo Dashboard",
    kanji: "道場",
    icon: "⛩️",
    badge: "Sanctuary",
  },
  {
    href: "/watchtower",
    label: "The Watchtower",
    kanji: "見張台",
    icon: "🏯",
    badge: "Sky Finder",
  },
  {
    href: "/celestial-scroll",
    label: "Celestial Scroll",
    kanji: "天体巻物",
    icon: "📜",
    badge: "Events & Moon",
  },
  {
    href: "/spirit-lens",
    label: "The Spirit Lens",
    kanji: "霊眼レンズ",
    icon: "🔮",
    badge: "AI Image Lab",
  },
  {
    href: "/#honor-reward",
    label: "Honor & Rewards",
    kanji: "誉れと報酬",
    icon: "🏆",
    badge: "Quests & Ranks",
  },
  {
    href: "/#subscription-plans",
    label: "Subscription Plans",
    kanji: "階級の道",
    icon: "💳",
    badge: "Guild Tiers",
  },
] as const;

export function SiteSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* 1. MOBILE FLOATING HAMBURGER TRIGGER BUTTON (Top Left) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open left navigation menu"
        className="lg:hidden fixed top-3.5 left-4 z-50 flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[rgba(11,18,32,0.85)] px-2.5 py-1.5 text-xs text-[var(--gold-soft)] shadow-lg backdrop-blur-md hover:border-[var(--gold)]"
      >
        <span className="text-base">☰</span>
        <span className="font-serif font-bold text-sm">月</span>
      </button>

      {/* 2. MOBILE OFF-CANVAS OVERLAY & DRAWER */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[var(--midnight)] border-r border-[var(--border-strong)] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2"
                >
                  <span className="text-xl text-[var(--crimson-bright)]">月</span>
                  <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--gold-soft)]">
                    {APP_NAME}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[var(--mist)] hover:text-[var(--gold)]"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Items Block */}
              <nav className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.28em] text-[var(--gold)] font-mono block px-2">
                  聖域案内 · SANCTUARY
                </span>
                {SIDEBAR_NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href) && !item.href.startsWith("/#");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-item-shiny flex items-center justify-between rounded-md border p-2.5 text-xs transition ${
                        isActive
                          ? "border-[var(--gold)] bg-[rgba(196,163,90,0.18)] text-[var(--gold-soft)] font-semibold shadow-[0_0_12px_rgba(196,163,90,0.3)]"
                          : "border-[var(--border)] bg-[rgba(5,7,13,0.5)] text-[var(--mist)] hover:text-[var(--moonlight)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <div>
                          <span className="block font-medium text-[var(--moonlight)]">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-[var(--mist)]">{item.badge}</span>
                        </div>
                      </div>
                      <span className="font-serif text-xs text-[var(--crimson-bright)]">
                        {item.kanji}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer with Theme Toggle */}
            <div className="pt-4 border-t border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--mist)]">Theme:</span>
                <ThemeToggle showLabel />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DESKTOP PERMANENT LEFT SIDEBAR DOCK BLOCK */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 xl:w-72 flex-col justify-between border-r border-[var(--border)] bg-[rgba(11,18,32,0.92)] p-5 shadow-2xl backdrop-blur-xl overflow-y-auto">
        <div className="space-y-6">
          {/* Logo Block */}
          <Link href="/" className="group flex flex-col gap-1 border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--torii)] border border-[var(--gold)] text-sm font-serif text-[var(--moonlight)] shadow-[0_0_10px_rgba(196,163,90,0.4)]">
                月
              </span>
              <div>
                <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-wider text-[var(--gold-soft)] transition group-hover:text-[var(--gold)]">
                  {APP_NAME}
                </span>
                <span className="block text-[9px] uppercase tracking-[0.25em] text-[var(--mist)]">
                  The Samurai&apos;s Celestial Guide
                </span>
              </div>
            </div>
          </Link>

          {/* Dedicated Left Navigation Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)] font-mono font-semibold">
                ⛩️ 聖域案内 · PATHS
              </span>
              <span className="text-[10px] text-[var(--mist)] font-mono">6 Modules</span>
            </div>

            <nav className="space-y-1.5" aria-label="Main Sanctuary Navigation">
              {SIDEBAR_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href) && !item.href.startsWith("/#");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item-shiny group flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs transition-all duration-300 ${
                      isActive
                        ? "border-[var(--gold)] bg-[rgba(196,163,90,0.18)] text-[var(--gold-soft)] font-semibold shadow-[0_0_15px_rgba(196,163,90,0.25)]"
                        : "border-[var(--border)] bg-[rgba(5,7,13,0.4)] text-[var(--mist)] hover:text-[var(--moonlight)]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <span className="block font-medium text-[var(--moonlight)] truncate group-hover:text-[var(--gold-soft)]">
                          {item.label}
                        </span>
                        <span className="block text-[10px] text-[var(--mist)] truncate">
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    <span className="font-serif text-xs text-[var(--crimson-bright)] font-semibold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
                      {item.kanji}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mini Stargazer Identity Widget */}
          <div className="rounded-lg border border-[var(--border)] bg-[rgba(5,7,13,0.6)] p-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--torii)] border border-[var(--gold)] text-xs font-serif text-[var(--moonlight)]">
                {user.plan === "shogun" ? "将" : user.plan === "samurai" ? "侍" : "浪"}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-[var(--gold-soft)] truncate">
                  {user.name}
                </span>
                <span className="block text-[10px] text-[var(--mist)] truncate">
                  {user.honorPoints} Honor Points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Dark/Light Mode Switcher */}
        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--mist)] font-mono">Appearance:</span>
            <ThemeToggle showLabel />
          </div>
          <p className="text-[10px] text-[var(--mist)]/70 text-center font-mono">
            Tsukuyomi Celestial Framework
          </p>
        </div>
      </aside>
    </>
  );
}

