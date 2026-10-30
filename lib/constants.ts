export const APP_NAME = "Tsukuyomi Watch";
export const APP_TAGLINE = "The Samurai's Celestial Guide";

export const NAV_LINKS = [
  { href: "/", label: "Dojo", description: "Dashboard" },
  { href: "/watchtower", label: "Watchtower", description: "Stargazing finder" },
  {
    href: "/celestial-scroll",
    label: "Celestial Scroll",
    description: "Space events",
  },
  {
    href: "/spirit-lens",
    label: "Spirit Lens",
    description: "Image restoration",
  },
  {
    href: "/#honor-reward",
    label: "Honor & Rewards",
    description: "Missions & Ranks",
  },
  {
    href: "/#subscription-plans",
    label: "Subscription Plans",
    description: "Guild Tiers",
  },
] as const;

export const OPEN_METEO_ATTRIBUTION =
  "Weather data by Open-Meteo.com (CC BY 4.0)";

export const SPIRIT_LENS_SERVICE_URL =
  process.env.NEXT_PUBLIC_SPIRIT_LENS_URL ?? "http://127.0.0.1:8000";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
