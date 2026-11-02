interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 bg-[var(--color-border)] rounded ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
