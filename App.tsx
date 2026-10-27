import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  CollegeSubject,
  StudyMode,
  ChatSession,
  ChatMessage,
} from './types';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { ChatView } from './components/ChatView';
import { SummarizerView } from './components/SummarizerView';
import { QuizView } from './components/QuizView';
import { StudyHubView } from './components/StudyHubView';
import { ChatHistoryDrawer } from './components/ChatHistoryDrawer';
import {
  getStoredSessions,
  saveStoredSessions,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
  updateSessionMessages,
  deleteSession,
  clearAllSessions,
} from './utils/storage';
import { sendChatMessage } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [selectedSubject, setSelectedSubject] = useState<CollegeSubject>('General Studies');
  const [studyMode, setStudyMode] = useState<StudyMode>('general');

  // Sessions and Chat state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveId] = useState<string | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Cross-tab handover states (e.g. from Summarizer to Quiz or Chat)
  const [quizInitialTopic, setQuizInitialTopic] = useState<string>('');
  const [quizInitialContent, setQuizInitialContent] = useState<string>('');

  // Initialize sessions on mount
  useEffect(() => {
    let stored = getStoredSessions();
    if (stored.length === 0) {
      const initial = createNewSession(selectedSubject);
      stored = [initial];
    }
    setSessions(stored);

    const savedActiveId = getActiveSessionId();
    if (savedActiveId && stored.some((s) => s.id === savedActiveId)) {
      setActiveId(savedActiveId);
    } else {
      setActiveId(stored[0].id);
      setActiveSessionId(stored[0].id);
    }
  }, []);

  // Find active session
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Handle Send Message in Chat
  const handleSendMessage = async (userPrompt: string, mode: StudyMode) => {
    if (!currentSession || !userPrompt.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
      studyMode: mode,
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    const updatedSessions = updateSessionMessages(currentSession.id, updatedMessages);
    setSessions(updatedSessions);
    setIsLoadingChat(true);

    try {
      // Send conversational history for context
      const formattedHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendChatMessage(formattedHistory, mode, currentSession.subject || selectedSubject);

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'model',
        content: reply,
        timestamp: Date.now(),
        studyMode: mode,
      };

      const finalMessages = [...updatedMessages, aiMessage];
      const finalSessions = updateSessionMessages(currentSession.id, finalMessages);
      setSessions(finalSessions);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'model',
        content: `**Error**: ${err.message || 'Unable to connect to Gemini API. Please verify your connection or check your API key in the Secrets panel.'}`,
        timestamp: Date.now(),
      };
      const finalSessions = updateSessionMessages(currentSession.id, [...updatedMessages, errorMessage]);
      setSessions(finalSessions);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Handle Regenerate Last Response
  const handleRegenerateLast = async () => {
    if (!currentSession || currentSession.messages.length === 0 || isLoadingChat) return;

    // Filter out trailing model response if present
    const lastMsg = currentSession.messages[currentSession.messages.length - 1];
    let workingMessages = [...currentSession.messages];
    if (lastMsg.role === 'model') {
      workingMessages.pop();
    }

    if (workingMessages.length === 0) return;

    setIsLoadingChat(true);
    try {
      const formattedHistory = workingMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendChatMessage(formattedHistory, studyMode, currentSession.subject || selectedSubject);

      const newAiMsg: ChatMessage = {
        id: `msg_${Date.now()}_regen`,
        role: 'model',
        content: reply,
        timestamp: Date.now(),
        studyMode,
      };

      const finalSessions = updateSessionMessages(currentSession.id, [...workingMessages, newAiMsg]);
      setSessions(finalSessions);
    } catch (err: any) {
      console.error('Regenerate error:', err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Create new session
  const handleNewChat = () => {
    const newSession = createNewSession(selectedSubject);
    setSessions((prev) => [newSession, ...prev]);
    setActiveId(newSession.id);
    setActiveTab('chat');
  };

  // Select session from history
  const handleSelectSession = (id: string) => {
    setActiveId(id);
    setActiveSessionId(id);
    setActiveTab('chat');
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    const remaining = deleteSession(id);
    setSessions(remaining);
    if (activeSessionId === id) {
      if (remaining.length > 0) {
        setActiveId(remaining[0].id);
        setActiveSessionId(remaining[0].id);
      } else {
        const fresh = createNewSession(selectedSubject);
        setSessions([fresh]);
        setActiveId(fresh.id);
      }
    }
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    const updated = sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
    setSessions(updated);
    saveStoredSessions(updated);
  };

  // Clear all
  const handleClearAllSessions = () => {
    clearAllSessions();
    const fresh = createNewSession(selectedSubject);
    setSessions([fresh]);
    setActiveId(fresh.id);
  };

  // Handover from Summarizer to Quiz
  const handleSummarizerToQuiz = (text: string, title?: string) => {
    setQuizInitialTopic(title || 'Summary Notes');
    setQuizInitialContent(text);
    setActiveTab('quiz');
  };

  // Handover to Chat with pre-loaded prompt
  const handleSendToChat = async (prompt: string) => {
    setActiveTab('chat');
    await handleSendMessage(prompt, studyMode);
  };

  // Handover from Study Hub workflow to Chat
  const handleLaunchStudyWorkflow = async (mode: StudyMode, prompt: string) => {
    setStudyMode(mode);
    setActiveTab('chat');
    await handleSendMessage(prompt, mode);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewChat={handleNewChat}
        historyCount={sessions.length}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full relative">
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            onRegenerateLast={handleRegenerateLast}
            isLoading={isLoadingChat}
            studyMode={studyMode}
            setStudyMode={setStudyMode}
            selectedSubject={selectedSubject}
          />
        )}

        {activeTab === 'summarizer' && (
          <SummarizerView
            selectedSubject={selectedSubject}
            onSendToQuiz={handleSummarizerToQuiz}
            onSendToChat={handleSendToChat}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            selectedSubject={selectedSubject}
            initialTopic={quizInitialTopic}
            initialContent={quizInitialContent}
            onSendToChat={handleSendToChat}
          />
        )}

        {activeTab === 'study_hub' && (
          <StudyHubView
            selectedSubject={selectedSubject}
            onLaunchStudyWorkflow={handleLaunchStudyWorkflow}
          />
        )}
      </main>

      {/* History Slide-over Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAll={handleClearAllSessions}
      />

      {/* Mobile Fixed Bottom Navigation Bar (Android Touch Ergonomics) */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
