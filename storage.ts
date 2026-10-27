import { ChatSession, ChatMessage } from '../types';

const STORAGE_KEY = 'abi_ai_chat_sessions_v1';
const ACTIVE_SESSION_KEY = 'abi_ai_active_session_id';

export function getStoredSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored chat sessions:', e);
    return [];
  }
}

export function saveStoredSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat sessions to localStorage:', e);
  }
}

export function getActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

export function setActiveSessionId(id: string): void {
  localStorage.setItem(ACTIVE_SESSION_KEY, id);
}

export function createNewSession(subject: string = 'General Studies', initialPrompt?: string): ChatSession {
  const newSession: ChatSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: initialPrompt ? initialPrompt.slice(0, 36) + (initialPrompt.length > 36 ? '...' : '') : 'New Study Session',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    subject,
    studyMode: 'general',
    messages: [
      {
        id: `msg_${Date.now()}`,
        role: 'model',
        content: `**Hi, I'm ABi AI — your college study assistant.**\n\nI can help you master tough coursework, draft essay outlines, solve STEM problems, summarize lecture notes, and generate practice quizzes.\n\nWhat are you studying today?`,
        timestamp: Date.now(),
      },
    ],
  };

  const sessions = getStoredSessions();
  const updated = [newSession, ...sessions];
  saveStoredSessions(updated);
  setActiveSessionId(newSession.id);
  return newSession;
}

export function updateSessionMessages(
  sessionId: string,
  messages: ChatMessage[],
  customTitle?: string
): ChatSession[] {
  const sessions = getStoredSessions();
  const updated = sessions.map((s) => {
    if (s.id === sessionId) {
      // Auto-generate title from first user message if still default
      let title = s.title;
      if (customTitle) {
        title = customTitle;
      } else if (s.title === 'New Study Session') {
        const firstUserMsg = messages.find((m) => m.role === 'user');
        if (firstUserMsg) {
          title = firstUserMsg.content.slice(0, 32).trim() + (firstUserMsg.content.length > 32 ? '...' : '');
        }
      }

      return {
        ...s,
        title,
        messages,
        updatedAt: Date.now(),
      };
    }
    return s;
  });

  saveStoredSessions(updated);
  return updated;
}

export function deleteSession(sessionId: string): ChatSession[] {
  const sessions = getStoredSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);
  saveStoredSessions(filtered);
  return filtered;
}

export function clearAllSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

export function exportSessionMarkdown(session: ChatSession): void {
  const dateStr = new Date(session.createdAt).toLocaleDateString();
  let md = `# ABi AI Study Session: ${session.title}\n`;
  md += `**Date**: ${dateStr} · **Subject**: ${session.subject || 'General'} · **Mode**: ${session.studyMode || 'general'}\n\n---\n\n`;

  session.messages.forEach((m) => {
    const roleName = m.role === 'user' ? 'Student' : 'ABi AI';
    const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    md += `### ${roleName} (${time})\n\n${m.content}\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 25)}_notes.md`;
  a.click();
  URL.revokeObjectURL(url);
}
