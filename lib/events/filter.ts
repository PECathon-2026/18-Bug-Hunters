import type { CelestialEvent, CelestialEventType } from "@/lib/events/types";

export type EventFilters = {
  types?: CelestialEventType[];
  query?: string;
  from?: string;
  to?: string;
};

export function filterEvents(
  events: CelestialEvent[],
  filters: EventFilters,
): CelestialEvent[] {
  const q = filters.query?.trim().toLowerCase() ?? "";
  const fromMs = filters.from ? Date.parse(filters.from) : null;
  const toMs = filters.to ? Date.parse(filters.to) : null;

  return events
    .filter((event) => {
      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(event.type)) return false;
      }
      if (q) {
        const hay = `${event.title} ${event.description} ${event.source}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const start = Date.parse(event.startTime);
      if (fromMs !== null && !Number.isNaN(fromMs) && start < fromMs) return false;
      if (toMs !== null && !Number.isNaN(toMs) && start > toMs) return false;
      return true;
    })
    .sort(
      (a, b) => Date.parse(a.startTime) - Date.parse(b.startTime),
    );
}
