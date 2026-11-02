"use client";

import Link from 'next/link';
import type { Scheme } from '@/lib/types';
import { useLanguage } from '@/lib/context/LanguageContext';

interface SchemeCardProps {
  scheme: Scheme;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  const { language } = useLanguage();

  return (
    <article className="flex flex-col justify-between p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] hover:border-[var(--color-primary)] transition-all h-full">
      <div>
        {/* Scheme Name as Link */}
        <h3 className="text-lg font-semibold text-[var(--color-text)] leading-snug">
          <Link
            href={`/schemes/${scheme.slug}`}
            className="hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:underline transition-colors"
          >
            {scheme.name}
          </Link>
        </h3>

        {/* Short summary truncated to 2 lines */}
        <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2">
          {scheme.summary}
        </p>
      </div>

      {/* Card footer with View details link */}
      <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
        <Link
          href={`/schemes/${scheme.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors group"
        >
          <span>{language === "HI" ? "विवरण देखें" : "View details"}</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
