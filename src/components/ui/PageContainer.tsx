import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageContainer({ children, className = '', narrow = false }: PageContainerProps) {
  return (
    <main
      id="main-content"
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 ${narrow ? 'max-w-3xl' : 'max-w-7xl'} ${className}`}
      role="main"
    >
      {children}
    </main>
  );
}
