import React from 'react';
import { ActiveTab } from '../types';
import { MessageSquare, FileText, CheckCircle2, BookOpen } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b16]/95 backdrop-blur-md border-t border-slate-850 h-[60px] px-2 shadow-2xl"
      aria-label="Mobile Navigation Bar"
    >
      <div className="grid grid-cols-4 items-center h-full max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'chat' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Chatbot tab"
        >
          <div
            className={`p-1 rounded-lg transition-transform ${
              activeTab === 'chat' ? 'bg-purple-950/60 scale-105' : ''
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('summarizer')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'summarizer' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Summarizer tab"
        >
          <div
            className={`p-1 rounded-lg transition-transform ${
              activeTab === 'summarizer' ? 'bg-purple-950/60 scale-105' : ''
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'quiz' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Quiz Generator tab"
        >
          <div
            className={`p-1 rounded-lg transition-transform ${
              activeTab === 'quiz' ? 'bg-purple-950/60 scale-105' : ''
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab('study_hub')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'study_hub' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Study Hub tab"
        >
          <div
            className={`p-1 rounded-lg transition-transform ${
              activeTab === 'study_hub' ? 'bg-purple-950/60 scale-105' : ''
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Hub</span>
        </button>
      </div>
    </nav>
  );
};
