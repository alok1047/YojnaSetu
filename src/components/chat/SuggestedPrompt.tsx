interface SuggestedPromptProps {
  label: string;
  onClick: (label: string) => void;
}

export function SuggestedPrompt({ label, onClick }: SuggestedPromptProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className="px-4 py-2.5 text-sm text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full hover:border-[var(--color-primary)] hover:bg-[var(--color-accent-soft)] transition-colors text-left"
    >
      {label}
    </button>
  );
}

export const DEFAULT_SUGGESTIONS = [
  "What support is available for students?",
  "Show schemes for small farmers",
  "What documents are needed to apply for housing schemes?",
  "Are there health insurance schemes for low-income families?",
  "What pension schemes are available for senior citizens?",
  "How do I apply for education scholarships?",
] as const;
