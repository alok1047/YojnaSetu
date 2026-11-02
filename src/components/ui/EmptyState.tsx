import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 text-[var(--color-muted)]" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-muted)] max-w-md">{description}</p>
      {action && (
        <Button variant="secondary" className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
