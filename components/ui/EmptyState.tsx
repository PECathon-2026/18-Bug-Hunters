type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="ink-panel rounded-md px-4 py-8 text-center">
      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--moonlight)]">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--mist)]">{message}</p>
    </div>
  );
}
