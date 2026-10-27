import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, StudyMode, CollegeSubject } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { sendChatMessage } from '../services/api';
import {
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Brain,
  Calculator,
  PenTool,
  GraduationCap,
  Layers,
  ArrowDown,
} from 'lucide-react';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (userMessage: string, studyMode: StudyMode) => Promise<void>;
  onRegenerateLast: () => Promise<void>;
  isLoading: boolean;
  studyMode: StudyMode;
  setStudyMode: (mode: StudyMode) => void;
  selectedSubject: CollegeSubject;
}

const STUDY_MODES: { id: StudyMode; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'general',
    label: 'General Tutor',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    desc: 'Versatile academic guidance across all college subjects',
  },
  {
    id: 'feynman',
    label: 'Feynman Explainer',
    icon: <Brain className="w-3.5 h-3.5" />,
    desc: 'Translates hard concepts into intuitive analogies & deep mechanisms',
  },
  {
    id: 'problem_solver',
    label: 'Problem Solver',
    icon: <Calculator className="w-3.5 h-3.5" />,
    desc: 'Step-by-step derivations for STEM, math, and logical proofs',
  },
  {
    id: 'essay_coach',
    label: 'Essay Coach',
    icon: <PenTool className="w-3.5 h-3.5" />,
    desc: 'Thesis refinement, academic outlining, and scholarly arguments',
  },
  {
    id: 'exam_prep',
    label: 'Exam Cram',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    desc: 'High-yield exam topics, mnemonics, and frequent midterm traps',
  },
];

const SUGGESTED_PROMPTS = [
  'Explain the Central Limit Theorem using an everyday analogy',
  'Derive Bayes theorem step-by-step with an intuition check',
  'Critique my thesis statement on artificial intelligence ethics',
  'Give me 3 tough midterm questions on DNA replication with answers',
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onRegenerateLast,
  isLoading,
  studyMode,
  setStudyMode,
  selectedSubject,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust textarea height automatically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(trimmed, studyMode);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const activeModeObj = STUDY_MODES.find((m) => m.id === studyMode) || STUDY_MODES[0];

  return (
    <div className="flex flex-col h-[calc(100vh-62px)] md:h-[calc(100vh-64px)] max-w-4xl mx-auto w-full px-3 sm:px-4">
      {/* Study Mode Selector Bar */}
      <div className="pt-2 pb-2 shrink-0">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {STUDY_MODES.map((mode) => {
              const isSelected = mode.id === studyMode;
              return (
                <button
                  key={mode.id}
                  onClick={() => setStudyMode(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[34px] whitespace-nowrap ${
                    isSelected
                      ? 'bg-purple-600/90 text-white shadow-sm shadow-purple-900/40 border border-purple-400/40'
                      : 'bg-[#0f162c] text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                  title={mode.desc}
                >
                  {mode.icon}
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-purple-300 font-mono shrink-0 pl-2">
            <span>{selectedSubject}</span>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
        {messages.map((message, idx) => {
          const isUser = message.role === 'user';
          const isLastModelMsg = !isUser && idx === messages.length - 1;

          return (
            <div
              key={message.id || idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`rounded-2xl px-4 py-3 max-w-[92%] sm:max-w-[85%] md:max-w-[80%] transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-950/40 rounded-br-sm'
                    : 'bg-[#0c1224] border border-slate-800 text-slate-200 shadow-sm rounded-bl-sm glow-subtle'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ABi AI</span>
                      {message.studyMode && message.studyMode !== 'general' && (
                        <span className="text-[11px] text-slate-400 font-normal">
                          · {STUDY_MODES.find((m) => m.id === message.studyMode)?.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => handleCopyMessage(message.id, message.content)}
                        className="p-1 hover:text-purple-300 transition-colors"
                        title="Copy message"
                        aria-label="Copy message text"
                      >
                        {copiedMsgId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isLastModelMsg && (
                        <button
                          onClick={onRegenerateLast}
                          disabled={isLoading}
                          className="p-1 hover:text-purple-300 transition-colors disabled:opacity-40"
                          title="Regenerate response"
                          aria-label="Regenerate response"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {isUser ? (
                  <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}
              </div>

              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 bg-[#0c1224] border border-slate-800 rounded-2xl px-4 py-3 max-w-sm rounded-bl-sm">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center animate-pulse">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span>ABi AI is synthesizing knowledge</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
              </span>
            </div>
          </div>
        )}

        {/* Suggested Prompts if conversation is fresh */}
        {messages.length <= 2 && !isLoading && (
          <div className="pt-2 pb-4">
            <p className="text-xs font-semibold text-slate-400 mb-2">Try asking ABi AI:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(prompt, studyMode)}
                  className="text-left text-xs p-2.5 rounded-xl bg-[#0e1529] hover:bg-[#141d38] border border-slate-800/90 hover:border-purple-500/50 text-slate-300 hover:text-white transition-all flex items-start gap-2"
                >
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar (Sticky above bottom nav on mobile, bottom of screen on desktop) */}
      <div className="pb-16 md:pb-3 pt-2 shrink-0">
        <div className="relative flex items-end gap-2 bg-[#0c1224] border border-slate-700/80 focus-within:border-purple-500 rounded-2xl p-2 shadow-xl transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Ask anything about ${selectedSubject}... (Shift+Enter for newline)`}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 resize-none max-h-32 focus:outline-none px-2 py-1.5"
            disabled={isLoading}
          />

          <button
            onClick={handleSubmit}
            disabled={!inputText.trim() || isLoading}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 shadow-md shadow-purple-900/30"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
