'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage as ChatMessageType, ChatResponse } from '@/lib/types';
import { DisclaimerNotice, Button } from '@/components/ui';
import { ChatMessage, ChatComposer, SuggestedPrompt, DEFAULT_SUGGESTIONS } from '@/components/chat';

export function AskPageClient() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(
    async (questionText: string) => {
      const trimmed = questionText.trim();
      if (!trimmed || isLoading) return;

      setLastUserPrompt(trimmed);

      const userMsg: ChatMessageType = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: trimmed,
            conversationId: conversationId || undefined,
          }),
        });

        if (!response.ok) {
          let errorMsg = 'Unable to get an answer from the assistant.';
          try {
            const errorJson = await response.json();
            if (errorJson.message || errorJson.error) {
              errorMsg = errorJson.message || errorJson.error;
            }
          } catch {
            errorMsg = `Server error (${response.status}): ${response.statusText}`;
          }
          throw new Error(errorMsg);
        }

        const data: ChatResponse = await response.json();

        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        const assistantMsg: ChatMessageType = {
          id: `asst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          content: data.answer,
          citations: data.citations || [],
          followUpSuggestions: data.followUpSuggestions || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An unexpected connection error occurred. Please check your network or try again.';

        const errorMsg: ChatMessageType = {
          id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          content: '',
          error: errorMessage,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, conversationId]
  );

  const handleResetConversation = useCallback(() => {
    setMessages([]);
    setConversationId('');
    setLastUserPrompt('');
  }, []);

  const handleRetry = useCallback(() => {
    if (lastUserPrompt) {
      handleSendMessage(lastUserPrompt);
    }
  }, [lastUserPrompt, handleSendMessage]);

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)] bg-[var(--color-bg)]">
      {/* Header bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--color-text)]">
              Ask Scheme Assistant
            </h1>
            <p className="text-xs text-[var(--color-muted)]">
              Grounded answers sourced directly from official guidelines and gazettes
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetConversation}
              className="text-xs"
            >
              New chat
            </Button>
          )}
        </div>
      </header>

      {/* Main chat messages container */}
      <main
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
        role="log"
        aria-live="polite"
        aria-label="Conversation with welfare assistant"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Always-visible disclaimer notice */}
          <DisclaimerNotice
            variant="info"
            message="This assistant provides informational answers based on official scheme publications. It does not replace formal verification with government departments."
          />

          {/* Initial state with welcome information and suggestions */}
          {messages.length === 0 && (
            <div className="py-6 sm:py-10 space-y-8 text-center sm:text-left">
              <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-3">
                <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-primary)]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  How can I help you today?
                </h2>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  Ask questions in plain language about central and state welfare programs,
                  eligibility requirements, application steps, or required paperwork. Answers
                  include citations to source documents and page numbers.
                </p>
              </div>

              {/* Suggested starter questions */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  Frequently Asked Questions
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {DEFAULT_SUGGESTIONS.map((suggestion) => (
                    <SuggestedPrompt
                      key={suggestion}
                      label={suggestion}
                      onClick={handleSendMessage}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversation messages */}
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <ChatMessage message={message} />
              {message.error && lastUserPrompt && (
                <div className="flex justify-start pl-11">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleRetry}
                    className="text-xs"
                  >
                    <svg
                      className="w-3.5 h-3.5 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 21h5v-5" />
                    </svg>
                    Retry question
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Loading state indicator */}
          {isLoading && (
            <ChatMessage
              message={{
                id: 'active-loading-indicator',
                role: 'assistant',
                content: '',
                isLoading: true,
                timestamp: new Date(),
              }}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Sticky chat composer footer */}
      <footer className="sticky bottom-0 z-20">
        <ChatComposer
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask a question about government welfare schemes…"
        />
      </footer>
    </div>
  );
}
