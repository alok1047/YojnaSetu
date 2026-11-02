'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, ChevronDown } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/types';
import { SourceCitationCard } from './SourceCitationCard';

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectSuggestion?: (suggestion: string) => void;
}

export function ChatMessage({ message, onSelectSuggestion }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [showCitations, setShowCitations] = useState<boolean>(false);

  return (
    <div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      role="article"
      aria-label={`${isUser ? 'Your' : 'Assistant'} message`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div
          className="shrink-0 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 shadow-2xs mt-0.5"
          aria-hidden="true"
        >
          {/* YojnaSetu Dharma Chakra Logo */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-slate-900"
          >
            <circle cx="50" cy="50" r="44" strokeWidth="5" />
            <circle
              cx="50"
              cy="50"
              r="14"
              strokeWidth="5"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 44 * Math.cos((i * 30 * Math.PI) / 180)}
                y2={50 + 44 * Math.sin((i * 30 * Math.PI) / 180)}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>
      )}

      <div className={`max-w-[90%] sm:max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        {/* Message label */}
        <p
          className={`text-[11px] font-medium mb-1 ${
            isUser ? 'text-right text-slate-500' : 'text-left text-slate-500'
          }`}
        >
          {isUser ? 'You' : 'YojnaAi'}
        </p>

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-md shadow-xs font-normal'
              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md shadow-xs'
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-1.5 py-1 px-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          ) : message.error ? (
            <div className="text-rose-600" role="alert">
              <p className="font-semibold text-xs sm:text-sm">Unable to complete request</p>
              <p className="text-xs mt-1 text-rose-500">{message.error}</p>
            </div>
          ) : isUser ? (
            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
          ) : (
            <div className="prose-chat text-slate-800 text-sm leading-relaxed space-y-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  strong: ({ ...props }) => (
                    <strong className="font-bold text-slate-900" {...props} />
                  ),
                  b: ({ ...props }) => (
                    <b className="font-bold text-slate-900" {...props} />
                  ),
                  h1: ({ ...props }) => (
                    <h1 className="text-base font-bold text-slate-900 mt-3 mb-1.5" {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className="text-sm font-bold text-slate-900 mt-2.5 mb-1" {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="my-1.5 leading-relaxed text-slate-800" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul
                      className="my-1.5 ml-4 list-disc space-y-1 text-slate-800 marker:text-emerald-600"
                      {...props}
                    />
                  ),
                  ol: ({ ...props }) => (
                    <ol
                      className="my-1.5 ml-4 list-decimal space-y-1 text-slate-800 marker:font-semibold marker:text-slate-700"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => <li className="leading-relaxed pl-0.5" {...props} />,
                  code: ({ inline, ...props }: { inline?: boolean; children?: React.ReactNode }) =>
                    inline ? (
                      <code
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono font-medium"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block p-3 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono overflow-x-auto my-2"
                        {...props}
                      />
                    ),
                  table: ({ ...props }) => (
                    <div className="overflow-x-auto my-2.5">
                      <table
                        className="min-w-full text-xs border border-slate-200 rounded-lg overflow-hidden"
                        {...props}
                      />
                    </div>
                  ),
                  th: ({ ...props }) => (
                    <th
                      className="bg-slate-100 px-3 py-1.5 text-left font-semibold text-slate-900 border-b border-slate-200"
                      {...props}
                    />
                  ),
                  td: ({ ...props }) => (
                    <td
                      className="px-3 py-1.5 border-b border-slate-100 text-slate-700"
                      {...props}
                    />
                  ),
                  a: ({ ...props }) => (
                    <a
                      className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Citations - Collapsible Accordion (Perplexity/GPT Style) */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-2.5" aria-label="Sources">
            <button
              type="button"
              onClick={() => setShowCitations(!showCitations)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-white transition-all cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified Sources ({message.citations.length})</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  showCitations ? 'rotate-180 text-emerald-600' : ''
                }`}
              />
            </button>

            {showCitations && (
              <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                {message.citations.map((citation, idx) => (
                  <SourceCitationCard key={`${citation.chunkId}-${idx}`} citation={citation} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Follow-up suggestions */}
        {!isUser && message.followUpSuggestions && message.followUpSuggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.followUpSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion?.(suggestion)}
                className="text-xs px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-full border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xs mt-0.5"
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
}
