import React, { useState } from 'react';
import { SummaryFormat, SummaryLength, SummaryStats, CollegeSubject } from '../types';
import { summarizeText } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Clock,
  Percent,
  BookOpen,
  ArrowRight,
  ListOrdered,
  FileCheck,
  HelpCircle,
} from 'lucide-react';

interface SummarizerViewProps {
  selectedSubject: CollegeSubject;
  onSendToQuiz: (text: string, title?: string) => void;
  onSendToChat: (text: string) => void;
}

const SAMPLE_TEXTS = [
  {
    title: 'CS: Deadlocks & Concurrency',
    subject: 'Computer Science & IT',
    content: `In multi-threaded and concurrent operating systems, a deadlock is a state where a set of threads are blocked because each process is holding a resource and waiting for another resource acquired by some other process. Four Coffman conditions must hold simultaneously for a deadlock to occur: 1. Mutual Exclusion: At least one resource must be held in a non-shareable mode. 2. Hold and Wait: A process must be currently holding at least one resource and requesting additional resources being held by other processes. 3. No Preemption: Resources cannot be forcibly taken from a process; they can only be released voluntarily. 4. Circular Wait: A closed chain of processes exists such that each process holds one or more resources needed by the next process in the chain. Modern systems handle deadlocks via prevention (designing protocols that invalidate one of the four conditions), avoidance (such as Dijkstra's Banker's Algorithm which calculates safe sequences before resource allocation), detection and recovery (terminating processes or preempting resources), or ostrich algorithm (ignoring the problem if deadlocks occur infrequently).`,
  },
  {
    title: 'Biology: Cellular Respiration',
    subject: 'Biology & Pre-Med',
    content: `Cellular respiration is a series of metabolic pathways that extract energy from bonds in glucose to synthesize adenosine triphosphate (ATP). The process occurs in four primary phases: Glycolysis, Pyruvate Oxidation, the Citric Acid (Krebs) Cycle, and Oxidative Phosphorylation. Glycolysis takes place in the cytoplasm and is anaerobic, breaking down 1 glucose molecule into 2 pyruvate, yielding a net 2 ATP and 2 NADH. Under aerobic conditions, pyruvate enters the mitochondrial matrix, where it is converted into Acetyl-CoA with the release of CO2 and generation of NADH. The Krebs cycle further oxidizes Acetyl-CoA, producing 2 ATP, 6 NADH, and 2 FADH2 per glucose molecule. Finally, oxidative phosphorylation utilizes the electron transport chain (ETC) along the inner mitochondrial membrane, establishing a proton gradient across the intermembrane space. ATP synthase harnesses this chemiosmotic gradient to phosphorylate ADP into ATP, generating approximately 26 to 28 additional ATP molecules. Oxygen serves as the final electron acceptor, combining with protons to form H2O.`,
  },
  {
    title: 'Econ: Keynesian vs Monetarist',
    subject: 'Business & Economics',
    content: `Macroeconomic stabilization theory centers around the debate between Keynesian and Monetarist economic schools. Keynesian economics, pioneered by John Maynard Keynes during the Great Depression, posits that aggregate demand is volatile and often fails to reach full employment automatically due to sticky prices and wages. During recessions, Keynesians advocate counter-cyclical fiscal policy—namely government deficit spending, infrastructure investment, and tax cuts—to stimulate demand through the fiscal multiplier. In contrast, Monetarism, led by Milton Friedman, asserts that excessive government intervention induces inflation and crowding-out effects. Monetarists argue that the money supply is the primary determinant of price levels and nominal GDP in the long run. They advocate a steady, predictable monetary growth rule by the central bank rather than discretionary fiscal interventions, asserting that market economies possess strong self-correcting mechanisms if money supply growth is kept stable.`,
  },
];

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  selectedSubject,
  onSendToQuiz,
  onSendToChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [format, setFormat] = useState<SummaryFormat>('bullets');
  const [length, setLength] = useState<SummaryLength>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await summarizeText(inputText, format, length, selectedSubject);
      setSummaryResult(res.summary);
      setStats(res.stats);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to summarize text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="max-w-5xl mx-auto w-full px-3.5 sm:px-6 py-4 pb-20 md:pb-8">
      {/* Page Title & Intro */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-900/50 flex items-center justify-center text-purple-400">
            <FileText className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Academic Text Summarizer
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Transform lengthy lecture transcripts, research papers, and textbook chapters into high-yield study notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Input and Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-4 shadow-xl">
            {/* Sample loaders */}
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Course Text or Lecture Notes
              </label>
              <span className="text-[11px] font-mono text-slate-500">{wordCount} words</span>
            </div>

            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your syllabus notes, reading assignment, or research abstract here..."
              className="w-full bg-[#070b17] border border-slate-700/80 focus:border-purple-500 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 resize-y focus:outline-none transition-colors"
            />

            {/* Quick Samples */}
            <div className="mt-2.5">
              <span className="text-[11px] text-slate-400 block mb-1.5">Load sample college lecture:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_TEXTS.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(sample.content)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0e162e] hover:bg-[#162142] border border-slate-800 text-slate-300 transition-colors"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Format Options */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('bullets')}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    format === 'bullets'
                      ? 'bg-purple-900/40 border-purple-500 text-white'
                      : 'bg-[#070b17] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Key Takeaways</div>
                    <div className="text-[10px] text-slate-400">Bulleted core points</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('executive')}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    format === 'executive'
                      ? 'bg-purple-900/40 border-purple-500 text-white'
                      : 'bg-[#070b17] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Executive 1-Min</div>
                    <div className="text-[10px] text-slate-400">Condensed brief</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('glossary')}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    format === 'glossary'
                      ? 'bg-purple-900/40 border-purple-500 text-white'
                      : 'bg-[#070b17] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Concept Glossary</div>
                    <div className="text-[10px] text-slate-400">Terms & definitions</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('study_sheet')}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    format === 'study_sheet'
                      ? 'bg-purple-900/40 border-purple-500 text-white'
                      : 'bg-[#070b17] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Exam Cheat Sheet</div>
                    <div className="text-[10px] text-slate-400">Theorems & questions</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Length Control */}
            <div className="mt-3.5">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Summary Length
              </label>
              <div className="flex gap-2">
                {(['short', 'medium', 'detailed'] as SummaryLength[]).map((len) => (
                  <button
                    key={len}
                    onClick={() => setLength(len)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize border transition-all ${
                      length === len
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-[#070b17] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSummarize}
              disabled={!inputText.trim() || isLoading}
              className="mt-4 w-full min-h-[46px] rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Academic Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output & Stats */}
        <div className="lg:col-span-6 space-y-4">
          {summaryResult && stats ? (
            <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
              {/* Stats Card */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#070b17] rounded-xl border border-slate-800/80 text-center">
                <div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Percent className="w-3 h-3 text-purple-400" />
                    <span>Compression</span>
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {stats.reductionPercent}%
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span>Saved Time</span>
                  </div>
                  <div className="text-base font-bold text-purple-300 font-mono mt-0.5">
                    ~{stats.savedTimeMinutes} min
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">Words</div>
                  <div className="text-base font-bold text-slate-200 font-mono mt-0.5">
                    {stats.summaryWords}
                  </div>
                </div>
              </div>

              {/* Summary Content */}
              <div className="bg-[#070b17] border border-slate-800/90 rounded-xl p-4 max-h-[420px] overflow-y-auto">
                <MarkdownRenderer content={summaryResult} />
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0f172e] hover:bg-[#162142] border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSendToQuiz(summaryResult, 'Lecture Notes')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-xs font-medium text-purple-200 hover:text-white transition-colors"
                >
                  <span>Generate Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSendToChat(`Here is a summary of my lecture notes:\n\n${summaryResult}\n\nCan you quiz me or elaborate further?`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e162f] hover:bg-[#142042] border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <span>Discuss in Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1021]/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-semibold text-slate-200 mb-1">
                Summary Output Window
              </h2>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Paste your notes on the left and select your desired format to generate high-retention study digests.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
