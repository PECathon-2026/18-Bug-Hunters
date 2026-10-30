import { APP_NAME, OPEN_METEO_ATTRIBUTION } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[rgba(5,7,13,0.7)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-[var(--mist)] sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {APP_NAME} — PECathon PS-002. Night Honor Score is a project metric,
          not an official scientific measurement.
        </p>
        <p className="sm:text-right">{OPEN_METEO_ATTRIBUTION}</p>
      </div>
    </footer>
  );
}
