import { ChatMessage, QuizData, FlashcardDeck, SummaryFormat, SummaryLength, SummaryStats, StudyMode } from '../types';

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  studyMode: StudyMode = 'general',
  subject?: string
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, studyMode, subject }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network response error' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}

export async function summarizeText(
  text: string,
  format: SummaryFormat = 'bullets',
  length: SummaryLength = 'medium',
  subject?: string
): Promise<{ summary: string; stats: SummaryStats }> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, format, length, subject }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Summarization failed' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function generateQuiz(
  topic: string,
  content?: string,
  questionCount: number = 5,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  subject?: string
): Promise<QuizData> {
  const response = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, content, questionCount, difficulty, subject }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Quiz generation failed' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function generateFlashcards(
  topic: string,
  notes?: string,
  count: number = 6,
  subject?: string
): Promise<FlashcardDeck> {
  const response = await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, notes, count, subject }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Flashcard generation failed' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function checkServerHealth(): Promise<{ hasApiKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { hasApiKey: false, model: 'unknown' };
    return await res.json();
  } catch {
    return { hasApiKey: false, model: 'unknown' };
  }
}
