import type { InputHTMLAttributes } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ onSearch, className = '', ...props }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-muted)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) {
            onSearch((e.target as HTMLInputElement).value);
          }
        }}
        {...props}
      />
    </div>
  );
}
