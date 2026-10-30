import type { MoonPhaseInfo } from "@/lib/moon/phase";

type MoonPhaseDisplayProps = {
  moon: MoonPhaseInfo;
};

export function MoonPhaseDisplay({ moon }: MoonPhaseDisplayProps) {
  const illuminationPct = Math.round(moon.illumination * 100);
  return (
    <div className="ink-panel flex items-center gap-4 rounded-md p-4">
      <div
        aria-hidden
        className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--ink)]"
        style={{
          boxShadow: "inset -8px 0 0 rgba(5,7,13,0.65)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full bg-[var(--gold-soft)]"
          style={{
            opacity: 0.25 + moon.illumination * 0.55,
          }}
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--gold)]">
          Moon phase
        </p>
        <p className="font-[family-name:var(--font-display)] text-xl text-[var(--moonlight)]">
          {moon.phaseName}
        </p>
        <p className="text-sm text-[var(--mist)]">
          {illuminationPct}% illuminated · calculated
        </p>
        <p className="mt-1 max-w-md text-xs text-[var(--mist)]">{moon.explanation}</p>
      </div>
    </div>
  );
}
