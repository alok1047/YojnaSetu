import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { SourceCitationCard } from "./SourceCitationCard";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      role="article"
      aria-label={`${isUser ? "Your" : "Assistant"} message`}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center"
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
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

      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "order-first" : ""}`}>
        {/* Message label */}
        <p className={`text-xs font-medium mb-1 ${isUser ? "text-right" : "text-left"} text-[var(--color-muted)]`}>
          {isUser ? "You" : "Assistant"}
        </p>

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-[var(--color-primary)] text-white rounded-br-md"
              : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-bl-md"
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-muted)]">
                Searching available documents…
              </span>
              <div className="flex gap-1" aria-hidden="true">
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          ) : message.error ? (
            <div className="text-[var(--color-danger)]" role="alert">
              <p className="font-medium">Something went wrong</p>
              <p className="text-xs mt-1 opacity-80">{message.error}</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3" aria-label="Sources">
            <p className="text-xs font-medium text-[var(--color-muted)] mb-2">
              Sources
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
                className="text-xs px-3 py-1.5 bg-[var(--color-accent-soft)] text-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                type="button"
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
          className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
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
