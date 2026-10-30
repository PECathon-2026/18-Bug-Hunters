import type { ScoreLabel } from "@/lib/scoring/night-honor";

type ScoreGaugeProps = {
  score: number | null;
  label: ScoreLabel | "unavailable";
  size?: "sm" | "lg";
};

const labelColor: Record<ScoreLabel | "unavailable", string> = {
  favorable: "var(--success)",
  moderate: "var(--warning)",
  poor: "var(--danger)",
  unavailable: "var(--mist)",
};

export function ScoreGauge({ score, label, size = "lg" }: ScoreGaugeProps) {
  const display = score === null ? "—" : Math.round(score).toString();
  const dim = size === "lg" ? "h-28 w-28 text-3xl" : "h-20 w-20 text-2xl";

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative flex ${dim} items-center justify-center rounded-full border border-[var(--border-strong)] bg-[rgba(5,7,13,0.65)]`}
        style={{
          boxShadow: `inset 0 0 24px ${labelColor[label]}33`,
        }}
        aria-label={
          score === null
            ? "Night Honor Score unavailable"
            : `Night Honor Score ${display}, ${label}`
        }
      >
        <span className="font-[family-name:var(--font-display)] text-[var(--gold-soft)]">
          {display}
        </span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--mist)]">
          Night Honor
        </p>
        <p
          className="mt-1 font-[family-name:var(--font-display)] text-xl capitalize"
          style={{ color: labelColor[label] }}
        >
          {label}
        </p>
        <p className="mt-1 text-xs text-[var(--mist)]">Project metric · 0–100</p>
      </div>
    </div>
  );
}
