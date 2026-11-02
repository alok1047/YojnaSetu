interface PageHeadingProps {
  title: string;
  description?: string;
}

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-base text-[var(--color-muted)] max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
