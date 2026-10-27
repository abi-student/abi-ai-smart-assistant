import React, { useState } from 'react';
import { ChatSession } from '../types';
import { exportSessionMarkdown } from '../utils/storage';
import { X, Search, Trash2, Edit2, Check, Download, MessageSquare, AlertCircle } from 'lucide-react';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAll: () => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.subject && s.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startEditing = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleExport = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    exportSessionMarkdown(s);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        className="relative w-full max-w-md bg-[#090e1f] border-l border-slate-800 shadow-2xl flex flex-col h-full z-10"
        aria-label="Chat Sessions History"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#070b18]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Study Sessions</h2>
            <span className="text-xs font-mono text-slate-400">({sessions.length})</span>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Close history drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b border-slate-800/80">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search past study chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0d1428] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {searchTerm ? 'No sessions matching your search.' : 'No saved sessions yet. Start asking ABi AI questions!'}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const date = new Date(session.updatedAt || session.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });
              const msgCount = session.messages.length;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group relative rounded-xl p-3 border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#151c36] border-purple-500/80 shadow-md shadow-purple-950/40'
                      : 'bg-[#0d1326] border-slate-800/90 hover:border-slate-700 hover:bg-[#111830]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {editingId === session.id ? (
                      <form
                        onSubmit={(e) => saveRename(session.id, e)}
                        className="flex items-center gap-1.5 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          className="w-full bg-[#0a0f20] border border-purple-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-slate-200 truncate">
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>{date}</span>
                          <span aria-hidden="true">·</span>
                          <span>{msgCount} messages</span>
                          {session.subject && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-purple-400 truncate max-w-[120px]">
                                {session.subject}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEditing(session, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                        title="Rename"
                        aria-label="Rename session"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleExport(session, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-700/50"
                        title="Export as Markdown"
                        aria-label="Export session as markdown"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                        title="Delete"
                        aria-label="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-[#070b18] space-y-2">
          {/* Download Project ZIP for GitHub */}
          <a
            href="/api/download-zip"
            download="abi-ai-project.zip"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-purple-950/40 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Project ZIP (for GitHub)</span>
          </a>

          {showClearConfirm ? (
            <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-3 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Delete all chat history?</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearAll();
                    setShowClearConfirm(false);
                  }}
                  className="px-3 py-1 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-500 font-medium"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={sessions.length === 0}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
