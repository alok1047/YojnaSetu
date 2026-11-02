'use client';

import { Plus, MessageSquare, Trash2, PanelLeftClose, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface ChatSessionMeta {
  id: string;
  title: string;
  updatedAt: number;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSessionMeta[];
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatSidebarProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <aside
      className="w-64 sm:w-72 h-full bg-[#F9F9F8] border-r border-slate-200/90 flex flex-col shrink-0 select-none z-30 transition-all duration-200"
      aria-label="Chat history sidebar"
    >
      {/* Top action bar: New Chat + Collapse button */}
      <div className="p-3.5 flex items-center gap-2 border-b border-slate-200/70">
        <button
          type="button"
          onClick={onNewChat}
          className="flex-1 flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
            <span>{language === 'HI' ? 'नई चैट' : 'New chat'}</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
            Alt+N
          </kbd>
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          aria-label={language === 'HI' ? 'साइडबार बंद करें' : 'Close sidebar'}
          title={language === 'HI' ? 'साइडबार बंद करें' : 'Close sidebar'}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Chats list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        <div className="px-2.5 pt-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {language === 'HI' ? 'हाल की बातचीत' : 'Recent Chats'}
        </div>

        {sessions.length === 0 ? (
          <div className="px-3 py-10 flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 rounded-full bg-slate-200/60 flex items-center justify-center mb-2.5 text-slate-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-600">
              {language === 'HI' ? 'कोई पुरानी चैट नहीं है' : 'No previous chats'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
              {language === 'HI'
                ? 'आपकी बातचीत यहाँ अपने आप सुरक्षित हो जाएगी'
                : 'Questions you ask will appear here automatically'}
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-200 text-slate-900 font-medium shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate text-left">{session.title}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-300/40 rounded-md transition-all cursor-pointer"
                  aria-label="Delete chat"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer stats & link */}
      <div className="p-3 border-t border-slate-200/70 bg-white/40 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>644 {language === 'HI' ? 'योजनाएं उपलब्ध' : 'Indexed Schemes'}</span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <Link
          href="/schemes"
          className="flex items-center gap-2 text-[11px] text-slate-500 hover:text-blue-600 px-1 py-1 rounded transition-colors group"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span>{language === 'HI' ? 'सभी योजनाएं ब्राउज़ करें' : 'Browse Scheme Directory'}</span>
        </Link>
      </div>
    </aside>
  );
}
