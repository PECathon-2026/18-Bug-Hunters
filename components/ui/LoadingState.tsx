type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Consulting the night sky…" }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="ink-panel flex items-center gap-3 rounded-md px-4 py-5"
    >
      <span
        className="inline-block h-3 w-3 rounded-full bg-[var(--gold)] animate-pulse-soft"
        aria-hidden
      />
      <p className="text-sm text-[var(--mist)]">{label}</p>
    </div>
  );
}
