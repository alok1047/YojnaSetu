import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'warning' | 'danger' | 'success';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-[var(--color-muted)]',
  primary: 'bg-[var(--color-accent-soft)] text-[var(--color-primary)]',
  warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  success: 'bg-[var(--color-accent-soft)] text-[var(--color-primary)]',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
