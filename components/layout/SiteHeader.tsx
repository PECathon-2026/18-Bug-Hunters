"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { ProfileButton } from "@/components/layout/ProfileButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CalmingZenBGM } from "@/components/audio/CalmingZenBGM";

/**
 * =========================================================================
 * FRONTEND COMPONENT: Top Navigation & Status Bar (SiteHeader)
 * =========================================================================
 * Displays:
 *   - Sanctuary Brand Title & Kanji Crest
 *   - Calming Zen Background Music Toggle (Web Audio API)
 *   - Dark/Light Theme Toggle (Washi Day / Midnight Void)
 *   - User Profile Dropdown & Passport Quick Link
 */
export function SiteHeader() {
  return (
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(5,7,13,0.85)] backdrop-blur-md transition-colors">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            {/* Left: Mobile Title (offset for hamburger) or Desktop Breadcrumb */}
            <div className="flex items-center gap-3 pl-12 lg:pl-0">
              <Link href="/" className="group flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base text-[var(--crimson-bright)] font-serif font-bold">月</span>
                  <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--gold-soft)] transition group-hover:text-[var(--gold)] sm:text-xl font-bold">
                    {APP_NAME}
                  </span>
                </div>
                <span className="hidden sm:inline truncate text-[10px] uppercase tracking-[0.28em] text-[var(--mist)]">
                  The Samurai&apos;s Celestial Guide · 夜空の道場
                </span>
              </Link>
            </div>

            {/* Right Action Bar: Zen Music BGM + Theme Mode Switcher + Profile Gateway */}
            <div className="flex items-center gap-2 sm:gap-3">
              <CalmingZenBGM />
              <ThemeToggle />
              <ProfileButton />
            </div>
          </div>
        </header>
        );
}
