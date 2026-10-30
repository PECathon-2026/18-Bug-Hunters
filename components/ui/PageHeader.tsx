type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="animate-fade-up mb-8 space-y-3">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--gold)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[var(--moonlight)] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--mist)] sm:text-base">
          {description}
        </p>
      ) : null}
      <div className="gold-rule max-w-md" />
    </div>
  );
}
