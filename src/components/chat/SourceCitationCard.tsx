import type { SourceCitation } from "@/lib/types";

interface SourceCitationCardProps {
  citation: SourceCitation;
}

export function SourceCitationCard({ citation }: SourceCitationCardProps) {
  return (
    <div className="flex flex-col gap-1.5 p-3.5 bg-[#181b26] border border-white/10 rounded-xl text-sm shadow-sm transition-colors hover:border-white/20">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-slate-100 leading-snug text-xs sm:text-sm">
          {citation.title}
        </h4>
        {citation.pageNumber && (
          <span className="shrink-0 text-[11px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full font-mono">
            Page {citation.pageNumber}
          </span>
        )}
      </div>

      {citation.excerpt && (
        <blockquote className="text-xs text-slate-300 italic border-l-2 border-emerald-500/60 pl-2.5 mt-1 line-clamp-3">
          &ldquo;{citation.excerpt}&rdquo;
        </blockquote>
      )}

      {citation.sourceUrl && (
        <a
          href={citation.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 hover:underline mt-1 w-fit font-medium"
        >
          Open official document
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
