'use client';

import { Plus, MessageSquare, Trash2, PanelLeftClose, Sparkles } from 'lucide-react';
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
      className="w-64 sm:w-72 h-full bg-slate-100/90 border-r border-slate-200 flex flex-col shrink-0 select-none z-30 transition-all"
      aria-label="Chat history sidebar"
    >
      {/* Top action bar: New Chat + Collapse button */}
      <div className="p-3 flex items-center gap-2 border-b border-slate-200/70">
        <button
          type="button"
          onClick={onNewChat}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer group"
        >
          <Plus className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
          <span>{language === 'HI' ? 'नई चैट' : 'New chat'}</span>
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          aria-label={language === 'HI' ? 'साइडबार बंद करें' : 'Close sidebar'}
          title={language === 'HI' ? 'साइडबार बंद करें' : 'Close sidebar'}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Chats list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {language === 'HI' ? 'हाल की बातचीत' : 'Recent Chats'}
        </div>

        {sessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-slate-400">
            {language === 'HI' ? 'कोई पुरानी बातचीत नहीं है' : 'No previous chats yet'}
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-200/90 text-slate-900 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
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
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-300/40 rounded transition-all cursor-pointer"
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

      {/* Footer stats */}
      <div className="p-3 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between bg-slate-100/50">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>644 {language === 'HI' ? 'योजनाएं उपलब्ध' : 'Schemes indexed'}</span>
        </span>
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
      </div>
    </aside>
  );
}
