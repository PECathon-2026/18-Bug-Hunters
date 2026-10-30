"use client";

import React, { useState, useMemo } from "react";
import {
  getMonthLunarDays,
  getNextFullMoonDates,
  type DayMoonInfo,
  type FullMoonSchedule,
} from "@/lib/moon/calendar";

interface LunarMiniCalendarProps {
  onSelectDate?: (dateIso: string) => void;
  selectedDateIso?: string;
}

export function MiniMoonIcon({
  phaseAngleDeg,
  illuminationPct,
  size = 28,
  glow = false,
}: {
  phaseAngleDeg: number;
  illuminationPct: number;
  size?: number;
  glow?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 1.5;
  const a = ((phaseAngleDeg % 360) + 360) % 360;

  // Render path for lit hemisphere
  const getLitPath = () => {
    if (illuminationPct >= 98) {
      return null; // Full circle
    }
    if (illuminationPct <= 2) {
      return ""; // No lit portion
    }

    const rad = (a * Math.PI) / 180;
    const rx = Math.max(0.01, R * Math.abs(Math.cos(rad)));

    if (a < 90) {
      // Waxing crescent
      return `M ${cx},${cy - R} A ${R},${R} 0 0,1 ${cx},${cy + R} A ${rx.toFixed(1)},${R} 0 0,0 ${cx},${cy - R}`;
    } else if (a < 180) {
      // Waxing gibbous
      return `M ${cx},${cy - R} A ${R},${R} 0 0,1 ${cx},${cy + R} A ${rx.toFixed(1)},${R} 0 0,1 ${cx},${cy - R}`;
    } else if (a < 270) {
      // Waning gibbous
      return `M ${cx},${cy - R} A ${R},${R} 0 0,0 ${cx},${cy + R} A ${rx.toFixed(1)},${R} 0 0,0 ${cx},${cy - R}`;
    } else {
      // Waning crescent
      return `M ${cx},${cy - R} A ${R},${R} 0 0,0 ${cx},${cy + R} A ${rx.toFixed(1)},${R} 0 0,1 ${cx},${cy - R}`;
    }
  };

  const isFull = illuminationPct >= 98;
  const isNew = illuminationPct <= 2;
  const litPath = getLitPath();

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`inline-block shrink-0 select-none ${glow || isFull ? "drop-shadow-[0_0_6px_rgba(232,238,248,0.7)]" : ""}`}
    >
      {/* Dark Lunar Body */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="#111827"
        stroke="rgba(196,163,90,0.3)"
        strokeWidth="0.75"
      />

      {/* Lunar Maria (dark craters) background texture */}
      <circle cx={cx - R * 0.3} cy={cy - R * 0.2} r={R * 0.22} fill="#0b0f19" opacity="0.6" />
      <circle cx={cx + R * 0.25} cy={cy + R * 0.25} r={R * 0.28} fill="#0b0f19" opacity="0.5" />
      <circle cx={cx - R * 0.15} cy={cy + R * 0.35} r={R * 0.18} fill="#0b0f19" opacity="0.6" />

      {/* Lit Moon Portion */}
      {isFull ? (
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="url(#fullMoonGrad)"
          stroke="#fff"
          strokeWidth="0.5"
        />
      ) : isNew ? null : litPath ? (
        <path d={litPath} fill="url(#moonlitGrad)" />
      ) : null}

      <defs>
        <radialGradient id="fullMoonGrad" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e8eef8" />
          <stop offset="100%" stopColor="#d2deee" />
        </radialGradient>
        <linearGradient id="moonlitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0c987" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LunarMiniCalendar({
  onSelectDate,
  selectedDateIso,
}: LunarMiniCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [activeDateInfo, setActiveDateInfo] = useState<DayMoonInfo | null>(null);

  // Month days
  const days = useMemo(
    () => getMonthLunarDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  // Empty leading cells
  const firstDayOfWeek = useMemo(
    () => new Date(currentYear, currentMonth, 1).getDay(),
    [currentYear, currentMonth],
  );

  // Next full moons
  const nextFullMoons = useMemo(() => getNextFullMoonDates(today, 5), [today]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const kanjiMonths = [
    "睦月", "如月", "弥生", "卯月", "皐月", "水無月",
    "文月", "葉月", "長月", "神無月", "霜月", "師走"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleResetToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleDayClick = (d: DayMoonInfo) => {
    setActiveDateInfo(d);
    onSelectDate?.(d.dateIso);
  };

  return (
    <div className="space-y-6">
      {/* 1. MINI CALENDAR INTERFACE */}
      <div className="ink-panel rounded-lg p-5 border border-[var(--border)] shadow-xl space-y-4">
        {/* Calendar Header with Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg text-[var(--crimson-bright)]">
                {kanjiMonths[currentMonth]}
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)]">
                {monthNames[currentMonth]} {currentYear}
              </h3>
            </div>
            <p className="text-xs text-[var(--mist)]">
              Daily calculated Moon positions, phases, and disk illumination
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="rounded-sm border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--mist)] hover:text-[var(--gold-soft)] hover:border-[var(--gold)]"
            >
              ‹ Prev
            </button>
            <button
              type="button"
              onClick={handleResetToday}
              className="rounded-sm border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--gold-soft)] hover:bg-[rgba(196,163,90,0.1)]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="rounded-sm border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--mist)] hover:text-[var(--gold-soft)] hover:border-[var(--gold)]"
            >
              Next ›
            </button>
          </div>
        </div>

        {/* Day-of-week header row */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--mist)]">
          <span className="text-red-400">Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span className="text-blue-400">Sat</span>
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells before 1st of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[64px] sm:min-h-[72px] rounded-sm bg-[rgba(5,7,13,0.3)] opacity-20"
            />
          ))}

          {/* Days of month */}
          {days.map((d) => {
            const isSelected = selectedDateIso === d.dateIso || activeDateInfo?.dateIso === d.dateIso;
            return (
              <button
                key={d.dateIso}
                type="button"
                onClick={() => handleDayClick(d)}
                className={`flex flex-col items-center justify-between min-h-[64px] sm:min-h-[72px] p-1 sm:p-1.5 rounded-md border text-center transition ${
                  isSelected
                    ? "border-[var(--gold)] bg-[rgba(196,163,90,0.2)] shadow-[0_0_12px_rgba(196,163,90,0.4)]"
                    : d.isToday
                      ? "border-[var(--gold)] bg-[rgba(196,163,90,0.08)] ring-1 ring-[var(--gold)]"
                      : d.isFullMoon
                        ? "border-[rgba(232,238,248,0.4)] bg-[rgba(232,238,248,0.04)] hover:border-[var(--gold)]"
                        : "border-[var(--border)]/60 bg-[rgba(5,7,13,0.5)] hover:border-[var(--border)] hover:bg-[rgba(196,163,90,0.05)]"
                }`}
              >
                {/* Day number */}
                <span
                  className={`text-[10px] sm:text-xs font-mono font-medium ${
                    d.isToday ? "text-[var(--gold)] font-bold" : "text-[var(--moonlight)]"
                  }`}
                >
                  {d.dayNumber}
                </span>

                {/* Small Picture of the Exact Moon */}
                <div className="my-0.5">
                  <MiniMoonIcon
                    phaseAngleDeg={d.phaseAngleDeg}
                    illuminationPct={d.illuminationPct}
                    size={22}
                    glow={d.isFullMoon}
                  />
                </div>

                {/* Very Small Label below the moon (e.g. Full, 84%, Wax Gibb) */}
                <span
                  className={`text-[8px] sm:text-[9px] font-mono leading-tight tracking-tighter truncate max-w-full ${
                    d.isFullMoon
                      ? "text-yellow-300 font-bold"
                      : d.isNewMoon
                        ? "text-[var(--mist)]/70"
                        : "text-[var(--mist)]"
                  }`}
                >
                  {d.shortPhase} {d.illuminationPct}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Telemetry Quick Bar */}
        {activeDateInfo && (
          <div className="mt-3 rounded-md border border-[var(--gold)] bg-[rgba(196,163,90,0.1)] p-3 text-xs text-[var(--moonlight)] flex flex-wrap items-center justify-between gap-3 animate-fade-up">
            <div className="flex items-center gap-2.5">
              <MiniMoonIcon
                phaseAngleDeg={activeDateInfo.phaseAngleDeg}
                illuminationPct={activeDateInfo.illuminationPct}
                size={28}
                glow
              />
              <div>
                <p className="font-semibold text-sm text-[var(--gold-soft)]">
                  {activeDateInfo.date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })} · {activeDateInfo.phaseName}
                </p>
                <p className="text-[11px] text-[var(--mist)] font-mono">
                  {activeDateInfo.illuminationPct}% Illuminated · Phase Angle: {activeDateInfo.phaseAngleDeg.toFixed(1)}° · Constellation: {activeDateInfo.zodiac}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectDate?.(activeDateInfo.dateIso)}
              className="rounded-sm bg-[var(--crimson)] px-3 py-1.5 text-xs text-white hover:bg-[var(--crimson-bright)]"
            >
              Filter Events For This Date →
            </button>
          </div>
        )}
      </div>

      {/* 2. NEXT FULL MOON DATES SECTION */}
      <div className="ink-panel rounded-lg p-5 border border-[var(--border)] shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌕</span>
              <span className="font-serif text-sm text-[var(--crimson-bright)]">次回満月の日</span>
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)]">
                Next Full Moon Dates
              </h3>
            </div>
            <p className="text-xs text-[var(--mist)]">
              Upcoming calculated 100% Full Moon peaks with traditional folklore monikers & countdowns
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[var(--gold)] font-mono">
            Astronomical Precision (UTC)
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nextFullMoons.map((fm, idx) => (
            <div
              key={fm.dateIso}
              className={`rounded-md border p-3.5 space-y-2 transition ${
                idx === 0
                  ? "border-[var(--gold)] bg-[rgba(196,163,90,0.12)] shadow-[0_0_15px_rgba(196,163,90,0.25)]"
                  : "border-[var(--border)] bg-[rgba(5,7,13,0.6)] hover:border-[var(--gold-soft)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MiniMoonIcon phaseAngleDeg={180} illuminationPct={100} size={26} glow />
                  <div>
                    <span className="font-serif text-xs text-[var(--crimson-bright)] block">
                      {fm.kanjiName}
                    </span>
                    <h4 className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--moonlight)]">
                      {fm.traditionalName}
                    </h4>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold whitespace-nowrap ${
                    fm.daysRemaining <= 1
                      ? "bg-[var(--crimson)] text-white"
                      : idx === 0
                        ? "bg-[var(--gold)] text-[var(--void)]"
                        : "bg-[rgba(196,163,90,0.15)] text-[var(--gold-soft)]"
                  }`}
                >
                  {fm.daysRemaining === 0
                    ? "Tonight!"
                    : fm.daysRemaining === 1
                      ? "Tomorrow"
                      : `in ${fm.daysRemaining} days`}
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--border)]/50 text-xs flex justify-between items-baseline font-mono">
                <span className="text-[var(--gold-soft)] font-medium">{fm.formattedDate}</span>
                <span className="text-[var(--mist)] text-[11px]">{fm.formattedTimeUtc}</span>
              </div>

              <div className="text-[10px] text-[var(--mist)] flex justify-between">
                <span>Constellation: {fm.zodiac}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentYear(fm.date.getUTCFullYear());
                    setCurrentMonth(fm.date.getUTCMonth());
                    onSelectDate?.(fm.dateIso);
                  }}
                  className="text-[var(--gold)] hover:underline"
                >
                  View in calendar →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

