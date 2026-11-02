import type { SourceCitation } from "@/lib/types";

interface SourceCitationCardProps {
  citation: SourceCitation;
}

export function SourceCitationCard({ citation }: SourceCitationCardProps) {
  return (
    <div className="flex flex-col gap-1.5 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-[var(--color-text)] leading-snug">
          {citation.title}
        </h4>
        {citation.pageNumber && (
          <span className="shrink-0 text-xs text-[var(--color-muted)] bg-gray-100 px-2 py-0.5 rounded">
            Page {citation.pageNumber}
          </span>
        )}
      </div>

      {citation.excerpt && (
        <blockquote className="text-xs text-[var(--color-muted)] italic border-l-2 border-[var(--color-border)] pl-3 mt-1 line-clamp-3">
          &ldquo;{citation.excerpt}&rdquo;
        </blockquote>
      )}

      {citation.sourceUrl && (
        <a
          href={citation.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mt-1 w-fit"
        >
          Open official source
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
          </svg>
          <span className="sr-only">(opens in new tab)</span>
        </a>
      )}
    </div>
  );
}
