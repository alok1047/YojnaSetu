"use client";

import { useState, useRef, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { Plus, Mic, AudioLines, ArrowUp, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

interface SpeechRecognitionEvent {
  results?: Array<Array<{ transcript?: string }>>;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface ChatComposerProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  isCentered?: boolean;
}

export function ChatComposer({
  onSubmit,
  isLoading,
  placeholder,
  isCentered = false,
}: ChatComposerProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { language } = useLanguage();

  const defaultPlaceholder =
    language === "HI"
      ? "योजना सहायक से पूछें..."
      : "Ask Scheme Assistant";

  const resolvedPlaceholder = placeholder || defaultPlaceholder;

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const trimmed = message.trim();
      if (!trimmed || isLoading) return;
      if (trimmed.length > 2000) return;
      onSubmit(trimmed);
      setMessage("");
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
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  }, []);

  const handleMicClick = useCallback(() => {
    if (typeof window === "undefined") return;

    // Browser SpeechRecognition fallback
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      textareaRef.current?.focus();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "HI" ? "hi-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      textareaRef.current?.focus();
    }
  }, [language]);

  return (
    <div className={isCentered ? "w-full" : "w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-4"}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
        <div className="relative flex items-center w-full rounded-full bg-white border border-slate-300 shadow-md shadow-slate-200/50 px-2.5 py-1.5 sm:px-3 sm:py-2 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          {/* Plus icon on left */}
          <button
            type="button"
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Quick options"
            onClick={() => textareaRef.current?.focus()}
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Textarea input */}
          <textarea
            ref={textareaRef}
            id="chat-input"
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={resolvedPlaceholder}
            maxLength={2000}
            disabled={isLoading}
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-none resize-none px-3 py-1.5 max-h-32 leading-relaxed shadow-none"
            style={{ outline: "none", border: "none", boxShadow: "none" }}
            aria-label="Question prompt"
          />

          {/* Mic icon */}
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-2 rounded-full transition-colors shrink-0 cursor-pointer ${
              isListening
                ? "text-rose-600 bg-rose-50 animate-pulse"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            aria-label="Voice input"
            title={isListening ? "Listening..." : "Click to speak"}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Right Action Button: Blue circle with AudioLines or ArrowUp */}
          <button
            type="submit"
            disabled={isLoading || (!message.trim() && !isCentered)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ml-1 transition-all active:scale-95 shadow-sm cursor-pointer ${
              message.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : isCentered
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            aria-label={message.trim() ? "Send message" : "Voice/Start"}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : message.trim() ? (
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <AudioLines className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Small subtle disclaimer at bottom only in docked mode */}
        {!isCentered && (
          <p className="mt-2 text-center text-[11px] text-slate-500">
            {language === "HI"
              ? "सत्यापन के लिए आधिकारिक दिशा-निर्देशों से जांचें। गोपनीय जानकारी साझा न करें।"
              : "Verify critical scheme rules with official department portals. Do not share sensitive personal IDs."}
          </p>
        )}
      </form>
    </div>
  );
}
