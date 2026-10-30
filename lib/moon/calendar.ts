import * as Astronomy from "astronomy-engine";

export type DayMoonInfo = {
  dayNumber: number;
  date: Date;
  dateIso: string;
  phaseAngleDeg: number;
  illumination: number;
  illuminationPct: number;
  phaseName: string;
  shortPhase: string;
  zodiac: string;
  isToday: boolean;
  isFullMoon: boolean;
  isNewMoon: boolean;
  isQuarter: boolean;
};

export type FullMoonSchedule = {
  date: Date;
  dateIso: string;
  formattedDate: string;
  formattedTimeUtc: string;
  daysRemaining: number;
  traditionalName: string;
  kanjiName: string;
  zodiac: string;
};

const ZODIAC_CONSTELLATIONS = [
  { name: "Aries", symbol: "♈", minLon: 0, maxLon: 30 },
  { name: "Taurus", symbol: "♉", minLon: 30, maxLon: 60 },
  { name: "Gemini", symbol: "♊", minLon: 60, maxLon: 90 },
  { name: "Cancer", symbol: "♋", minLon: 90, maxLon: 120 },
  { name: "Leo", symbol: "♌", minLon: 120, maxLon: 150 },
  { name: "Virgo", symbol: "♍", minLon: 150, maxLon: 180 },
  { name: "Libra", symbol: "♎", minLon: 180, maxLon: 210 },
  { name: "Scorpio", symbol: "♏", minLon: 210, maxLon: 240 },
  { name: "Sagittarius", symbol: "♐", minLon: 240, maxLon: 270 },
  { name: "Capricorn", symbol: "♑", minLon: 270, maxLon: 300 },
  { name: "Aquarius", symbol: "♒", minLon: 300, maxLon: 330 },
  { name: "Pisces", symbol: "♓", minLon: 330, maxLon: 360 },
];

const JAPANESE_FULL_MOONS: Record<number, { kanji: string; en: string }> = {
  0: { kanji: "睦月 狼月", en: "Wolf Moon · Mutsuki" },
  1: { kanji: "如月 雪月", en: "Snow Moon · Kisaragi" },
  2: { kanji: "弥生 虫月", en: "Worm Moon · Yayoi" },
  3: { kanji: "卯月 桃月", en: "Pink Moon · Uzuki" },
  4: { kanji: "皐月 花月", en: "Flower Moon · Satsuki" },
  5: { kanji: "水無月 苺月", en: "Strawberry Moon · Minazuki" },
  6: { kanji: "文月 雄鹿月", en: "Buck Moon · Fumizuki" },
  7: { kanji: "葉月 チョウザメ月", en: "Sturgeon Moon · Hazuki" },
  8: { kanji: "長月 中秋の名月", en: "Harvest Moon · Tsukimi" },
  9: { kanji: "神無月 狩猟月", en: "Hunter's Moon · Kannazuki" },
  10: { kanji: "霜月 ビーバー月", en: "Beaver Moon · Shimotsuki" },
  11: { kanji: "師走 寒月", en: "Cold Moon · Shiwasu" },
};

function getZodiacConstellation(date: Date): string {
  try {
    const time = Astronomy.MakeTime(date);
    const moonGeo = Astronomy.EclipticGeoMoon(time);
    const lon = ((moonGeo.lon % 360) + 360) % 360;
    const match = ZODIAC_CONSTELLATIONS.find((z) => lon >= z.minLon && lon < z.maxLon);
    return match ? `${match.symbol} ${match.name}` : "♈ Aries";
  } catch {
    return "🌙 Moon";
  }
}

function getPhaseNames(phaseAngleDeg: number): { full: string; short: string } {
  const a = ((phaseAngleDeg % 360) + 360) % 360;
  if (a < 15 || a >= 345) return { full: "New Moon", short: "New" };
  if (a < 75) return { full: "Waxing Crescent", short: "Wax Cres" };
  if (a < 105) return { full: "First Quarter", short: "1st Qtr" };
  if (a < 165) return { full: "Waxing Gibbous", short: "Wax Gibb" };
  if (a < 195) return { full: "Full Moon", short: "Full" };
  if (a < 255) return { full: "Waning Gibbous", short: "Wan Gibb" };
  if (a < 285) return { full: "Last Quarter", short: "Last Qtr" };
  return { full: "Waning Crescent", short: "Wan Cres" };
}

export function getMonthLunarDays(year: number, monthIndex: number): DayMoonInfo[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
  const currentDay = isCurrentMonth ? today.getDate() : -1;

  const result: DayMoonInfo[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day, 12, 0, 0);
    const time = Astronomy.MakeTime(date);
    const phaseAngleDeg = Astronomy.MoonPhase(time);
    const illum = Astronomy.Illumination(Astronomy.Body.Moon, time).phase_fraction;
    const illumPct = Math.round(illum * 100);
    const { full, short } = getPhaseNames(phaseAngleDeg);
    const isToday = day === currentDay;

    const isFullMoon = (illumPct >= 98 && Math.abs(phaseAngleDeg - 180) < 16) || short === "Full";
    const isNewMoon = illumPct <= 2 || short === "New";
    const isQuarter = short === "1st Qtr" || short === "Last Qtr";

    result.push({
      dayNumber: day,
      date,
      dateIso: date.toISOString().slice(0, 10),
      phaseAngleDeg,
      illumination: illum,
      illuminationPct: illumPct,
      phaseName: full,
      shortPhase: short,
      zodiac: getZodiacConstellation(date),
      isToday,
      isFullMoon,
      isNewMoon,
      isQuarter,
    });
  }

  return result;
}

export function getNextFullMoonDates(fromDate = new Date(), count = 6): FullMoonSchedule[] {
  const result: FullMoonSchedule[] = [];
  let currentTime = Astronomy.MakeTime(fromDate);
  const nowMs = fromDate.getTime();

  for (let i = 0; i < count; i++) {
    try {
      const full = Astronomy.SearchMoonPhase(180, currentTime, 120);
      if (!full || !full.date) break;

      const dateObj = full.date;
      const monthIdx = dateObj.getUTCMonth();
      const traditional = JAPANESE_FULL_MOONS[monthIdx] || { kanji: "満月", en: "Full Moon" };
      const diffMs = dateObj.getTime() - nowMs;
      const daysRemaining = Math.max(0, Math.ceil(diffMs / 86400000));

      result.push({
        date: dateObj,
        dateIso: dateObj.toISOString().slice(0, 10),
        formattedDate: dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }),
        formattedTimeUtc: dateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
          hour12: false,
        }) + " UTC",
        daysRemaining,
        traditionalName: traditional.en,
        kanjiName: traditional.kanji,
        zodiac: getZodiacConstellation(dateObj),
      });

      // Advance 2 days past the found full moon to search for subsequent one
      currentTime = Astronomy.MakeTime(new Date(dateObj.getTime() + 86400000 * 2));
    } catch {
      break;
    }
  }

  return result;
}
