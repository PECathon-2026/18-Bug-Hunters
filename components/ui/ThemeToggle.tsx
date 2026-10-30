"use client";

import React from "react";
import { useTheme } from "@/lib/theme/theme-context";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Daylight Washi Mode (陽)" : "Switch to Midnight Starlight Mode (陰)"}
      aria-label="Toggle dark and light mode"
      className={`relative inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[rgba(18,26,43,0.6)] px-2.5 py-1.5 text-xs text-[var(--moonlight)] transition-all duration-300 hover:border-[var(--gold)] hover:bg-[rgba(196,163,90,0.12)] active:scale-95 ${className}`}
    >
      <span className="text-sm transition-transform duration-300 transform group-hover:rotate-12">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>

      {showLabel && (
        <span className="font-medium text-[11px] tracking-wide">
          {theme === "dark" ? "Light Mode (陽)" : "Dark Mode (陰)"}
        </span>
      )}

      {/* Subtle indicator pill */}
      <span
        className={`h-2 w-2 rounded-full transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[var(--gold)] shadow-[0_0_6px_var(--gold)]"
            : "bg-[var(--crimson-bright)] shadow-[0_0_6px_var(--crimson-bright)]"
        }`}
      />
    </button>
  );
}

