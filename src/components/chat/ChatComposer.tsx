"use client";

import { useState, useRef, useCallback, type FormEvent, type KeyboardEvent } from "react";

interface ChatComposerProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSubmit,
  isLoading,
  placeholder = "Ask about welfare schemes, eligibility, or application steps…",
}: ChatComposerProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = message.trim();
      if (!trimmed || isLoading) return;
      if (trimmed.length > 2000) return;
      onSubmit(trimmed);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
    [message, isLoading, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, []);

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <label htmlFor="chat-input" className="sr-only">
              Type your question
            </label>
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={placeholder}
              rows={1}
              maxLength={2000}
              disabled={isLoading}
              className="w-full resize-none px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:opacity-50 transition-shadow"
              aria-describedby="chat-privacy-note"
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </button>
        </div>
        <p id="chat-privacy-note" className="mt-2 text-xs text-[var(--color-muted)]">
          Do not share Aadhaar numbers, bank details, or other sensitive personal
          information. Press Enter to send, Shift+Enter for a new line.
        </p>
      </form>
    </div>
  );
}
