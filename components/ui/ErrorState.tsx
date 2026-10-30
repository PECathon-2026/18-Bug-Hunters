type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="ink-panel rounded-md border-[rgba(163,59,59,0.45)] px-4 py-5"
    >
      <h3 className="mb-1 font-[family-name:var(--font-display)] text-lg text-[var(--crimson-bright)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--mist)]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-sm border border-[var(--border-strong)] px-3 py-1.5 text-sm text-[var(--gold-soft)] transition hover:bg-[rgba(196,163,90,0.1)]"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
