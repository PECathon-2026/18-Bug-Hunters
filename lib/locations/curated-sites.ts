export type CuratedSite = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  notes: string;
  /** 0 = darkest, 1 = severe urban glow — curated estimate, not a live sensor. */
  lightPollution: number | null;
  provenance: "curated";
  source: string;
};

/**
 * Curated observing-interest sites for demo purposes.
 * Coordinates are real places; light-pollution values are approximate curated estimates.
 * Not a claim of "best nearby observing site" without comparison data.
 */
export const CURATED_SITES: CuratedSite[] = [
  {
    id: "hanle",
    name: "Indian Astronomical Observatory, Hanle",
    latitude: 32.7789,
    longitude: 78.9642,
    region: "Ladakh, India",
    notes: "High-altitude research site; dark skies relative to urban India.",
    lightPollution: 0.15,
    provenance: "curated",
    source: "Curated demo dataset (public observatory location)",
  },
  {
    id: "nainital",
    name: "ARIES Nainital region",
    latitude: 29.36,
    longitude: 79.458,
    region: "Uttarakhand, India",
    notes: "Hill observatory region; moderate elevation.",
    lightPollution: 0.35,
    provenance: "curated",
    source: "Curated demo dataset",
  },
  {
    id: "kavalur",
    name: "Vainu Bappu Observatory, Kavalur",
    latitude: 12.576,
    longitude: 78.8267,
    region: "Tamil Nadu, India",
    notes: "Optical observatory campus; surrounding rural sky varies.",
    lightPollution: 0.3,
    provenance: "curated",
    source: "Curated demo dataset",
  },
  {
    id: "mount-abu",
    name: "Mount Abu vicinity",
    latitude: 24.5926,
    longitude: 72.7156,
    region: "Rajasthan, India",
    notes: "Hill station; light pollution varies with town proximity.",
    lightPollution: 0.45,
    provenance: "curated",
    source: "Curated demo dataset",
  },
  {
    id: "spiti",
    name: "Spiti Valley (Kaza vicinity)",
    latitude: 32.2273,
    longitude: 78.0702,
    region: "Himachal Pradesh, India",
    notes: "High cold desert valley popular for amateur astronomy trips.",
    lightPollution: 0.2,
    provenance: "curated",
    source: "Curated demo dataset",
  },
  {
    id: "mauna-kea",
    name: "Mauna Kea visitor region",
    latitude: 19.8207,
    longitude: -155.4681,
    region: "Hawaii, USA",
    notes: "World-class altitude; access and cultural rules apply.",
    lightPollution: 0.1,
    provenance: "curated",
    source: "Curated demo dataset",
  },
];

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function sitesNear(
  latitude: number,
  longitude: number,
  limit = 5,
): Array<CuratedSite & { distanceKm: number }> {
  return CURATED_SITES.map((site) => ({
    ...site,
    distanceKm: haversineKm(
      latitude,
      longitude,
      site.latitude,
      site.longitude,
    ),
  }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
