'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage as ChatMessageType, ChatResponse } from '@/lib/types';
import { Button } from '@/components/ui';
import { ChatMessage, ChatComposer, ChatSidebar } from '@/components/chat';
import type { ChatSessionMeta } from '@/components/chat';
import { useLanguage } from '@/lib/context/LanguageContext';
import { PanelLeft } from 'lucide-react';

interface StoredSession {
  id: string;
  title: string;
  messages: ChatMessageType[];
  updatedAt: number;
}

const STORAGE_KEY = 'yojnasetu_chat_sessions_v1';

export function AskPageClient() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredSession[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSessions(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load chat history from localStorage', err);
    }
  }, []);

  // Save sessions to localStorage helper
  const persistSessions = useCallback((updated: StoredSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save chat sessions to localStorage', err);
    }
  }, []);

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

      const currentSessionId = activeSessionId || `session-${Date.now()}`;
      if (!activeSessionId) {
        setActiveSessionId(currentSessionId);
      }

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

        setMessages((prev) => {
          const next = [...prev, assistantMsg];

          // Persist to session list in localStorage
          setSessions((prevSessions) => {
            const existingIdx = prevSessions.findIndex((s) => s.id === currentSessionId);
            const title =
              trimmed.length > 38 ? `${trimmed.slice(0, 38)}…` : trimmed;
            let updatedSessions: StoredSession[];

            if (existingIdx >= 0) {
              updatedSessions = [...prevSessions];
              updatedSessions[existingIdx] = {
                ...updatedSessions[existingIdx],
                messages: next,
                updatedAt: Date.now(),
              };
            } else {
              updatedSessions = [
                {
                  id: currentSessionId,
                  title,
                  messages: next,
                  updatedAt: Date.now(),
                },
                ...prevSessions,
              ];
            }

            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
            } catch (err) {
              console.error('Failed to sync chat history', err);
            }
            return updatedSessions;
          });

          return next;
        });
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
    [isLoading, conversationId, activeSessionId, language]
  );

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationId('');
    setActiveSessionId('');
    setLastUserPrompt('');
  }, []);

  const handleSelectSession = useCallback(
    (id: string) => {
      const found = sessions.find((s) => s.id === id);
      if (found) {
        setActiveSessionId(found.id);
        setConversationId(found.id);
        setMessages(found.messages);
        setLastUserPrompt('');
      }
    },
    [sessions]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      const updated = sessions.filter((s) => s.id !== id);
      persistSessions(updated);
      if (activeSessionId === id) {
        handleNewChat();
      }
    },
    [sessions, activeSessionId, persistSessions, handleNewChat]
  );

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

  // Keyboard shortcut: Alt+N / Option+N for New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  const sessionMetas: ChatSessionMeta[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    updatedAt: s.updatedAt,
  }));

  return (
    <div
      style={{ height: 'calc(100dvh - 4.5rem)', minHeight: 'calc(100dvh - 4.5rem)' }}
      className="flex flex-1 w-full overflow-hidden bg-slate-50 text-slate-900"
    >
      {/* ================= LEFT SIDE PANEL: NEW CHAT & HISTORY ================= */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
        sessions={sessionMetas}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {/* ================= MAIN CHAT AREA ================= */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
        {/* Toggle sidebar button when collapsed */}
        {!isSidebarOpen && (
          <div className="absolute top-3 left-3 z-20">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white/95 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title={language === 'HI' ? 'इतिहास दिखाएं' : 'Open chat history'}
            >
              <PanelLeft className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">
                {language === 'HI' ? 'चैट इतिहास' : 'History'}
              </span>
            </button>
          </div>
        )}

        {/* Main chat viewport */}
        {messages.length === 0 ? (
          /* ================= EMPTY STATE (Centered) ================= */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 overflow-y-auto">
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
                {/* Primary "What can you do?" pill */}
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
          /* ================= CONVERSATION THREAD ================= */
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
          <footer className="sticky bottom-0 z-10 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-3 pb-2">
            <ChatComposer
              onSubmit={handleSendMessage}
              isLoading={isLoading}
              isCentered={false}
            />
          </footer>
        )}
      </div>
    </div>
  );
}
