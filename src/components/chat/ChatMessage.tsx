import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { SourceCitationCard } from "./SourceCitationCard";

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectSuggestion?: (suggestion: string) => void;
}

export function ChatMessage({ message, onSelectSuggestion }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      role="article"
      aria-label={`${isUser ? "Your" : "Assistant"} message`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div
          className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
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
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </div>
      )}

      <div className={`max-w-[88%] sm:max-w-[78%] ${isUser ? "order-first" : ""}`}>
        {/* Message label */}
        <p
          className={`text-[11px] font-medium mb-1 ${
            isUser ? "text-right text-slate-400" : "text-left text-slate-400"
          }`}
        >
          {isUser ? "You" : "Scheme Assistant"}
        </p>

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-[#1d6ee5] text-white rounded-br-md shadow-md"
              : "bg-[#181b26] border border-white/10 text-slate-100 rounded-bl-md shadow-sm"
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2.5 py-1">
              <span className="text-slate-300 text-xs">
                Searching verified government documents…
              </span>
              <div className="flex gap-1" aria-hidden="true">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          ) : message.error ? (
            <div className="text-rose-400" role="alert">
              <p className="font-semibold text-xs sm:text-sm">Unable to complete request</p>
              <p className="text-xs mt-1 opacity-90">{message.error}</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
          )}
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3" aria-label="Sources">
            <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <span>Verified Sources ({message.citations.length})</span>
            </p>
            <div className="space-y-2">
              {message.citations.map((citation, idx) => (
                <SourceCitationCard key={`${citation.chunkId}-${idx}`} citation={citation} />
              ))}
            </div>
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
                className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full border border-white/10 transition-colors"
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
          className="shrink-0 w-8 h-8 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white shadow-sm"
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
