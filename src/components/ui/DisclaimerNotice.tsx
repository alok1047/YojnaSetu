interface DisclaimerNoticeProps {
  variant?: 'info' | 'warning';
  message: string;
}

export function DisclaimerNotice({ variant = 'info', message }: DisclaimerNoticeProps) {
  const styles = variant === 'warning'
    ? 'bg-[var(--color-warning-soft)] border-[var(--color-warning)] text-[var(--color-warning)]'
    : 'bg-[var(--color-accent-soft)] border-[var(--color-primary)] text-[var(--color-muted)]';

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-[var(--radius-control)] border-l-4 text-sm ${styles}`} role="note">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      <p>{message}</p>
    </div>
  );
}
