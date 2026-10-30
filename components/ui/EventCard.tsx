import type { CelestialEvent } from "@/lib/events/types";

type EventCardProps = {
  event: CelestialEvent;
  onSelect?: (event: CelestialEvent) => void;
  selected?: boolean;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function EventCard({ event, onSelect, selected }: EventCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(event)}
      className={`w-full rounded-md border px-4 py-3 text-left transition ${
        selected
          ? "border-[var(--gold)] bg-[rgba(196,163,90,0.1)]"
          : "border-[var(--border)] bg-[rgba(18,26,43,0.65)] hover:border-[var(--border-strong)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--gold)]">
            {event.type.replace("_", " ")}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg text-[var(--moonlight)]">
            {event.title}
          </h3>
        </div>
        <span className="shrink-0 text-xs text-[var(--mist)]">
          {formatWhen(event.startTime)} UTC
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-[var(--mist)]">
        {event.description}
      </p>
      <p className="mt-2 text-[11px] text-[var(--mist)]">
        Source: {event.source}
        {event.dataProvenance === "curated" ? " · curated dataset" : ""}
      </p>
    </button>
  );
}
