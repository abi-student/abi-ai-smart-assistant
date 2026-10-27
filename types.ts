export type StudyMode = 'general' | 'feynman' | 'problem_solver' | 'essay_coach' | 'exam_prep';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  studyMode?: StudyMode;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  subject?: string;
  studyMode?: StudyMode;
}

export type SummaryFormat = 'bullets' | 'executive' | 'glossary' | 'study_sheet';
export type SummaryLength = 'short' | 'medium' | 'detailed';

export interface SummaryStats {
  originalWords: number;
  summaryWords: number;
  reductionPercent: number;
  readingTimeMinutes: number;
  savedTimeMinutes: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag: string;
}

export interface QuizData {
  quizTitle: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: QuizQuestion[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  tip?: string;
}

export interface FlashcardDeck {
  title: string;
  cards: Flashcard[];
}

export type ActiveTab = 'chat' | 'summarizer' | 'quiz' | 'study_hub';

export const COLLEGE_SUBJECTS = [
  'General Studies',
  'Computer Science & IT',
  'Biology & Pre-Med',
  'Engineering & Physics',
  'Mathematics & Statistics',
  'Business & Economics',
  'Psychology & Social Sciences',
  'Literature & Humanities',
  'Law & Political Science',
] as const;

export type CollegeSubject = (typeof COLLEGE_SUBJECTS)[number];
