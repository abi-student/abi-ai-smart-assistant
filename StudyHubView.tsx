import React, { useState } from 'react';
import { CollegeSubject, FlashcardDeck, Flashcard, StudyMode } from '../types';
import { generateFlashcards } from '../services/api';
import {
  Brain,
  RotateCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  GraduationCap,
  PenTool,
  Calculator,
  Calendar,
  Layers,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

interface StudyHubViewProps {
  selectedSubject: CollegeSubject;
  onLaunchStudyWorkflow: (mode: StudyMode, prompt: string) => void;
}

const DEFAULT_DECK: FlashcardDeck = {
  title: 'High-Yield College Study Concepts',
  cards: [
    {
      id: 'c1',
      category: 'Computer Science',
      front: 'What is the primary difference between a Process and a Thread in operating systems?',
      back: 'A process has its own dedicated virtual memory address space, file handles, and resources. Threads live inside a process, sharing code, data, and heap, but each maintains its own stack and program counter.',
      tip: 'Mnemonic: P = Private memory, T = Together in process.',
    },
    {
      id: 'c2',
      category: 'Biology',
      front: 'Why is ATP synthase referred to as a molecular rotary motor?',
      back: 'Protons moving down their electrochemical gradient through the F0 subunit rotate the c-ring, driving conformational changes in the F1 catalytic subunit that synthesize ATP from ADP and Pi.',
      tip: 'Think of water turning a watermill wheel to grind grain.',
    },
    {
      id: 'c3',
      category: 'Economics',
      front: 'What is the difference between Normal Goods and Inferior Goods regarding Income Elasticity?',
      back: 'For Normal Goods, income elasticity of demand is positive (EY > 0), meaning demand increases as income rises. For Inferior Goods, elasticity is negative (EY < 0), so demand falls when consumer income rises.',
      tip: 'Instant ramen is classic inferior; dining out is normal.',
    },
    {
      id: 'c4',
      category: 'Mathematics',
      front: 'State the Fundamental Theorem of Calculus (Part 1).',
      back: 'If f is continuous on [a, b], then the function g(x) = ∫[a to x] f(t) dt is continuous on [a, b], differentiable on (a, b), and g\'(x) = f(x). Integration and differentiation are inverse operations.',
      tip: 'The rate of area accumulation equals the height of the curve.',
    },
  ],
};

export const StudyHubView: React.FC<StudyHubViewProps> = ({
  selectedSubject,
  onLaunchStudyWorkflow,
}) => {
  const [deck, setDeck] = useState<FlashcardDeck>(DEFAULT_DECK);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateCustomDeck = async () => {
    if (!topicInput.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const newDeck = await generateFlashcards(topicInput.trim(), undefined, 6, selectedSubject);
      if (newDeck.cards && newDeck.cards.length > 0) {
        setDeck(newDeck);
        setActiveCardIndex(0);
        setIsFlipped(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev + 1) % deck.cards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev - 1 + deck.cards.length) % deck.cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setDeck({ ...deck, cards: shuffled });
    setActiveCardIndex(0);
  };

  const currentCard: Flashcard | undefined = deck.cards[activeCardIndex];

  return (
    <div className="max-w-5xl mx-auto w-full px-3.5 sm:px-6 py-4 pb-20 md:pb-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-900/50 flex items-center justify-center text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            College Study Hub
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Supercharge your study sessions with Active Recall Flashcards and guided collegiate learning workflows.
        </p>
      </div>

      {/* Section 1: Active Recall Flashcard Deck */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Active Recall Flashcards</span>
            </h2>
            <span className="text-xs text-slate-400">{deck.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0e162e] hover:bg-[#152142] border border-slate-800 text-xs text-slate-300 transition-colors"
              title="Shuffle Cards"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
            <span className="text-xs font-mono text-purple-400 font-semibold px-2 py-1 bg-purple-950/40 rounded-lg border border-purple-800/60">
              {activeCardIndex + 1} / {deck.cards.length}
            </span>
          </div>
        </div>

        {/* 3D Flip Card Container */}
        {currentCard && (
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[260px] sm:min-h-[280px] bg-[#0c1224] border border-slate-700/80 hover:border-purple-500/60 rounded-3xl p-6 sm:p-8 cursor-pointer shadow-2xl transition-all relative flex flex-col justify-between select-none group glow-subtle"
          >
            {/* Top metadata */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-purple-400 font-medium">{currentCard.category}</span>
              <span className="text-[11px] text-slate-500 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                <span>{isFlipped ? 'Tap to view question' : 'Tap to flip answer'}</span>
              </span>
            </div>

            {/* Card Content (Front vs Back) */}
            <div className="py-6 flex flex-col items-center justify-center text-center">
              {!isFlipped ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Question / Prompt
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white max-w-lg leading-relaxed">
                    {currentCard.front}
                  </h3>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    Answer & Concept Explanation
                  </div>
                  <p className="text-sm sm:text-base text-slate-200 max-w-lg leading-relaxed">
                    {currentCard.back}
                  </p>
                  {currentCard.tip && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-purple-300 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-800/40 mt-2 max-w-md mx-auto">
                      <Lightbulb className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{currentCard.tip}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Controls */}
            <div
              className="flex items-center justify-between pt-2 border-t border-slate-800/80"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handlePrevCard}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#080d1a] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Previous card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-xs text-slate-500">
                Card {activeCardIndex + 1} of {deck.cards.length}
              </span>

              <button
                onClick={handleNextCard}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#080d1a] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Next card"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Generate Custom Flashcard Deck */}
        <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Generate New Flashcard Deck with Gemini
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Organic Chemistry Reactions, Microeconomics Supply & Demand, Linear Algebra"
              className="flex-1 bg-[#070b17] border border-slate-700/80 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={handleGenerateCustomDeck}
              disabled={!topicInput.trim() || isGenerating}
              className="min-h-[42px] px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30 disabled:opacity-40 transition-all shrink-0"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Building Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Deck</span>
                </>
              )}
            </button>
          </div>
          {errorMsg && (
            <p className="mt-2 text-xs text-rose-400">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Section 2: College Study Toolkits */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>Collegiate Study Toolkits</span>
          </h2>
          <p className="text-xs text-slate-400">
            One-click interactive workflows that configure ABi AI for specialized academic tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tool 1: Feynman Concept Explainer */}
          <div className="bg-[#0b1021] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Feynman Explainer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deconstruct any complex theory into simple real-world analogies, deep mechanisms, and common traps.
              </p>
            </div>
            <button
              onClick={() =>
                onLaunchStudyWorkflow(
                  'feynman',
                  `Can you explain a challenging concept from ${selectedSubject} using the Feynman technique with a clear analogy and test question?`
                )
              }
              className="mt-4 w-full py-2 rounded-xl bg-[#0e162f] hover:bg-purple-600 border border-slate-800 hover:border-purple-500 text-xs font-medium text-slate-300 hover:text-white transition-all text-center"
            >
              Start Explainer
            </button>
          </div>

          {/* Tool 2: STEM Problem Solver */}
          <div className="bg-[#0b1021] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Problem Solver</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step mathematical derivations, formula breakdowns, and sanity checks for STEM courses.
              </p>
            </div>
            <button
              onClick={() =>
                onLaunchStudyWorkflow(
                  'problem_solver',
                  `I need help solving a tough problem in ${selectedSubject}. Walk me through the step-by-step logic and formula verification.`
                )
              }
              className="mt-4 w-full py-2 rounded-xl bg-[#0e162f] hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-xs font-medium text-slate-300 hover:text-white transition-all text-center"
            >
              Solve Problem
            </button>
          </div>

          {/* Tool 3: Essay & Thesis Coach */}
          <div className="bg-[#0b1021] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-violet-950/60 border border-violet-800/60 flex items-center justify-center text-violet-400 mb-3 group-hover:scale-105 transition-transform">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Essay & Thesis Coach</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Refine thesis statements, evaluate counter-arguments, and structure compelling academic research papers.
              </p>
            </div>
            <button
              onClick={() =>
                onLaunchStudyWorkflow(
                  'essay_coach',
                  `Help me brainstorm and outline a strong research paper thesis for ${selectedSubject}. What are the primary scholarly debates?`
                )
              }
              className="mt-4 w-full py-2 rounded-xl bg-[#0e162f] hover:bg-violet-600 border border-slate-800 hover:border-violet-500 text-xs font-medium text-slate-300 hover:text-white transition-all text-center"
            >
              Outline Paper
            </button>
          </div>

          {/* Tool 4: 48-Hour Exam Cram Schedule */}
          <div className="bg-[#0b1021] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-300 mb-3 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Exam Cram Plan</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Build a realistic, high-yield cram schedule prioritizing top tested chapters, active recall, and rest intervals.
              </p>
            </div>
            <button
              onClick={() =>
                onLaunchStudyWorkflow(
                  'exam_prep',
                  `I have a midterm in ${selectedSubject} in 48 hours. Can you generate an intensive study schedule prioritizing high-yield topics, practice tests, and active recall blocks?`
                )
              }
              className="mt-4 w-full py-2 rounded-xl bg-[#0e162f] hover:bg-purple-600 border border-slate-800 hover:border-purple-500 text-xs font-medium text-slate-300 hover:text-white transition-all text-center"
            >
              Create Cram Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
