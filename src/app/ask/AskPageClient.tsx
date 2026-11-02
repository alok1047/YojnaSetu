'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage as ChatMessageType, ChatResponse } from '@/lib/types';
import { Button } from '@/components/ui';
import { ChatMessage, ChatComposer } from '@/components/chat';
import { useLanguage } from '@/lib/context/LanguageContext';

export function AskPageClient() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

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
          let errorMsg =
            language === 'HI'
              ? 'सहायक से उत्तर प्राप्त करने में असमर्थ।'
              : 'Unable to get an answer from the assistant.';
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
            : language === 'HI'
              ? 'एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।'
              : 'An unexpected connection error occurred. Please try again.';

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
    [isLoading, conversationId, language]
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

  // Prompt suggestions
  const initialPillPrompt =
    language === 'HI' ? 'आप क्या कर सकते हैं?' : 'What can you do?';

  const secondaryPills =
    language === 'HI'
      ? [
          'पीएम किसान योजना की पात्रता क्या है?',
          'आयुष्मान भारत में ₹5 लाख कवर कैसे मिलेगा?',
          'छात्रवृत्ति के लिए कौन से दस्तावेज़ चाहिए?',
        ]
      : [
          'What are PM-KISAN eligibility criteria?',
          'How does Ayushman Bharat ₹5 Lakh cover work?',
          'What documents are needed for scholarship?',
        ];

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-4.25rem)] bg-slate-50 text-slate-900">
      {/* Subtle top header bar (Light Mode) */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm sm:text-base font-semibold text-slate-900">
              {language === 'HI' ? 'योजना सेतु सहायक' : 'Ask Scheme Assistant'}
            </h1>
            <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium">
              RAG AI
            </span>
          </div>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetConversation}
              className="text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1 transition-colors"
            >
              {language === 'HI' ? 'नई चैट' : 'New chat'}
            </Button>
          )}
        </div>
      </header>

      {/* Main chat viewport */}
      {messages.length === 0 ? (
        /* ================= EMPTY STATE (ChatGPT-Style in Light Mode) ================= */
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-2xl text-center space-y-6">
            {/* Centered headline */}
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              {language === 'HI' ? 'हम कहाँ से शुरू करें?' : 'Where should we begin?'}
            </h2>

            {/* Pill capsule search bar (Light) */}
            <ChatComposer
              onSubmit={handleSendMessage}
              isLoading={isLoading}
              isCentered={true}
            />

            {/* Centered suggestion pills below the input */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {/* Primary "What can you do?" pill matching screenshot */}
              <button
                type="button"
                onClick={() => handleSendMessage(initialPillPrompt)}
                className="inline-flex items-center rounded-full bg-white hover:bg-slate-100 active:scale-95 text-slate-800 text-xs sm:text-sm font-medium px-4 py-2 border border-slate-300 shadow-xs transition-all cursor-pointer"
              >
                {initialPillPrompt}
              </button>

              {/* Secondary quick prompts */}
              {secondaryPills.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="hidden sm:inline-flex items-center rounded-full bg-white hover:bg-slate-100 active:scale-95 text-slate-600 hover:text-slate-900 text-xs font-normal px-3.5 py-1.5 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ================= CONVERSATION THREAD (Light Mode) ================= */
        <main
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
          role="log"
          aria-live="polite"
          aria-label="Conversation with welfare assistant"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <ChatMessage
                  message={message}
                  onSelectSuggestion={handleSendMessage}
                />
                {message.error && lastUserPrompt && (
                  <div className="flex justify-start pl-11">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleRetry}
                      className="text-xs bg-white text-slate-800 hover:bg-slate-100 border-slate-200 shadow-xs"
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
                      {language === 'HI' ? 'पुनः प्रयास करें' : 'Retry question'}
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
      )}

      {/* Sticky chat composer docked at the bottom ONLY when there are active messages */}
      {messages.length > 0 && (
        <footer className="sticky bottom-0 z-20">
          <ChatComposer
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            isCentered={false}
          />
        </footer>
      )}
    </div>
  );
}
