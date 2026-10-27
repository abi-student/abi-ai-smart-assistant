import React, { useState } from 'react';
import { QuizData, QuizQuestion, CollegeSubject } from '../types';
import { generateQuiz } from '../services/api';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Trophy,
  Brain,
  MessageSquare,
} from 'lucide-react';

interface QuizViewProps {
  selectedSubject: CollegeSubject;
  initialTopic?: string;
  initialContent?: string;
  onSendToChat: (prompt: string) => void;
}

const QUICK_TOPICS = [
  'Data Structures: Hash Tables & Binary Trees',
  'Organic Chemistry: SN1 vs SN2 Reactions',
  'Microeconomics: Price Elasticity of Demand',
  'Neuroscience: Action Potential & Ion Channels',
  'Calculus: Fundamental Theorem & Integration',
];

export const QuizView: React.FC<QuizViewProps> = ({
  selectedSubject,
  initialTopic = '',
  initialContent = '',
  onSendToChat,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [content, setContent] = useState(initialContent);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{ [qIndex: number]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() && !content.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await generateQuiz(topic, content, questionCount, difficulty, selectedSubject);
      setQuizData(data);
      setCurrentIndex(0);
      setSelectedOptions({});
      setShowExplanation(false);
      setIsCompleted(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (selectedOptions[currentIndex] !== undefined) return; // Already answered
    setSelectedOptions((prev) => ({ ...prev, [currentIndex]: optIndex }));
    setShowExplanation(true);

    // If this is the last question and answered, check for confetti
    if (currentIndex === (quizData?.questions.length || 0) - 1) {
      setTimeout(() => {
        // Trigger celebratory confetti if score is >= 70%
        let correctCount = 0;
        quizData?.questions.forEach((q, idx) => {
          const ans = idx === currentIndex ? optIndex : selectedOptions[idx];
          if (ans === q.correctIndex) correctCount++;
        });
        const total = quizData?.questions.length || 1;
        if (correctCount / total >= 0.7) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#a855f7', '#6366f1', '#38bdf8'],
          });
        }
      }, 500);
    }
  };

  const handleNext = () => {
    if (!quizData) return;
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(selectedOptions[currentIndex + 1] !== undefined);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRetake = () => {
    setSelectedOptions({});
    setCurrentIndex(0);
    setShowExplanation(false);
    setIsCompleted(false);
  };

  const handleResetQuiz = () => {
    setQuizData(null);
    setSelectedOptions({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  // Score calculation
  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedOptions[idx] === q.correctIndex) correct++;
    });
    const total = quizData.questions.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  const currentQ: QuizQuestion | undefined = quizData?.questions[currentIndex];
  const currentAnswer = selectedOptions[currentIndex];
  const isAnswered = currentAnswer !== undefined;

  return (
    <div className="max-w-3xl mx-auto w-full px-3.5 sm:px-6 py-4 pb-20 md:pb-8">
      {/* Page Title */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-900/50 flex items-center justify-center text-purple-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Interactive Quiz Generator
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Reinforce collegiate coursework through active recall, instant answer validation, and deep concept explanations.
        </p>
      </div>

      {/* Screen 1: Generator Setup Form */}
      {!quizData && (
        <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Quiz Topic or Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Operating Systems Scheduling, Microeconomics Supply Elasticity"
              className="w-full bg-[#070b17] border border-slate-700/80 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Quick Suggestion Pills */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5">Quick college topics:</span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TOPICS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTopic(item)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0e162e] hover:bg-[#162142] border border-slate-800 text-slate-300 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Source Content */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Optional: Paste Course Notes / Syllabus excerpt
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste specific textbook notes or study guide text to base questions on..."
              className="w-full bg-[#070b17] border border-slate-700/80 focus:border-purple-500 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-y focus:outline-none transition-colors"
            />
          </div>

          {/* Settings Grid: Difficulty and Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'beginner', label: '101 Intro' },
                  { id: 'intermediate', label: 'Mid-Level' },
                  { id: 'advanced', label: 'Advanced' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id as any)}
                    className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                      difficulty === d.id
                        ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                        : 'bg-[#070b17] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Question Count
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                      questionCount === num
                        ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                        : 'bg-[#070b17] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={(!topic.trim() && !content.trim()) || isLoading}
            className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Crafting Academic Quiz...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Generate Interactive Quiz</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Screen 2: Active Quiz Player */}
      {quizData && !isCompleted && currentQ && (
        <div className="space-y-4">
          {/* Header Strip: Progress & Title */}
          <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-purple-400">
                {quizData.quizTitle}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Question {currentIndex + 1} of {quizData.questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#070b17] h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / quizData.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800/80 text-purple-300 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                {currentIndex + 1}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = currentAnswer === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                let optionStyles = 'bg-[#070b17] border-slate-800 text-slate-200 hover:border-purple-500/60 hover:bg-[#0e162d]';

                if (isAnswered) {
                  if (isCorrect) {
                    optionStyles = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-900/30';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-950/40 border-rose-500 text-rose-200 shadow-sm shadow-rose-900/30';
                  } else {
                    optionStyles = 'bg-[#070b17]/50 border-slate-850 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    className={`w-full min-h-[50px] p-3 rounded-xl border text-left flex items-start gap-3 transition-all active:scale-[0.99] ${optionStyles}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#0d1428] text-slate-400 border border-slate-700'
                      }`}
                    >
                      {letter}
                    </span>

                    <span className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                      {option}
                    </span>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Section */}
            {isAnswered && (
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                    currentAnswer === currentQ.correctIndex
                      ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-100'
                      : 'bg-rose-950/30 border-rose-800/80 text-rose-100'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wide">
                    {currentAnswer === currentQ.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Correct Answer</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400">Incorrect Choice</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed text-slate-200">
                    {currentQ.explanation}
                  </p>
                </div>

                {/* Next Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleResetQuiz}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Exit Quiz
                  </button>

                  <button
                    onClick={handleNext}
                    className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-purple-900/30 active:scale-95 transition-all"
                  >
                    <span>
                      {currentIndex < quizData.questions.length - 1 ? 'Next Question' : 'View Results'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen 3: Quiz Completed / Results */}
      {quizData && isCompleted && (
        <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-purple-950/60">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Quiz Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">{quizData.quizTitle}</p>
          </div>

          {/* Score Ring / Card */}
          {(() => {
            const { correct, total, percentage } = calculateScore();
            let performanceTier = 'Needs Review';
            let tierColor = 'text-amber-400';
            if (percentage >= 80) {
              performanceTier = 'Excellent Mastery!';
              tierColor = 'text-emerald-400';
            } else if (percentage >= 60) {
              performanceTier = 'Solid Understanding';
              tierColor = 'text-purple-400';
            }

            return (
              <div className="bg-[#070b17] border border-slate-800 rounded-2xl p-4 max-w-sm mx-auto space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                  {percentage}%
                </div>
                <div className="text-xs text-slate-400">
                  {correct} out of {total} questions correct
                </div>
                <div className={`text-xs font-semibold ${tierColor}`}>
                  {performanceTier}
                </div>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0e162d] hover:bg-[#152040] border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-md shadow-purple-900/30"
            >
              <Brain className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>

            <button
              onClick={() => {
                const { correct, total } = calculateScore();
                onSendToChat(`I just scored ${correct}/${total} on the ${quizData.topic} quiz. Can you review the concepts with me and test me on my weak areas?`);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0f1830] hover:bg-[#162348] border border-slate-800 text-xs font-medium text-purple-300 hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discuss Results in Chat</span>
            </button>
          </div>

          {/* Detailed Question Review List */}
          <div className="pt-6 border-t border-slate-800 text-left space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Question Review
            </h3>
            <div className="space-y-3">
              {quizData.questions.map((q, idx) => {
                const userChoice = selectedOptions[idx];
                const isUserCorrect = userChoice === q.correctIndex;
                return (
                  <div
                    key={q.id || idx}
                    className="p-3.5 rounded-xl bg-[#070b17] border border-slate-800/90 text-xs space-y-1.5"
                  >
                    <div className="flex items-start gap-2">
                      {isUserCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="font-semibold text-slate-200">
                        {idx + 1}. {q.question}
                      </div>
                    </div>
                    <div className="text-slate-400 pl-6">
                      Correct answer:{' '}
                      <span className="text-emerald-400 font-medium">
                        {q.options[q.correctIndex]}
                      </span>
                    </div>
                    {!isUserCorrect && userChoice !== undefined && (
                      <div className="text-rose-400 pl-6">
                        Your answer: {q.options[userChoice]}
                      </div>
                    )}
                    <div className="text-slate-500 pl-6 text-[11px] leading-relaxed">
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
