import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple, robust Markdown parser tailored for AI study responses
  // Splits by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm md:text-base leading-relaxed text-slate-200">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
          const language = match ? match[1] || 'text' : 'text';
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div
              key={index}
              className="my-3 rounded-xl overflow-hidden border border-slate-700/70 bg-[#090d1a]"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0e1529] border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span>{language}</span>
                <button
                  onClick={() => handleCopyCode(code, index)}
                  className="flex items-center gap-1 text-slate-400 hover:text-purple-300 transition-colors p-1"
                  aria-label="Copy code"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-xs md:text-sm font-mono text-slate-100">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Parse regular markdown lines (headings, lists, bold)
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();

              if (!trimmed) {
                return <div key={lIdx} className="h-1.5" />;
              }

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="text-base font-bold text-purple-300 mt-3 mb-1">
                    {parseInline(trimmed.slice(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-slate-800/80">
                    {parseInline(trimmed.slice(3))}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="text-xl font-extrabold text-white mt-4 mb-2">
                    {parseInline(trimmed.slice(2))}
                  </h2>
                );
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <div
                    key={lIdx}
                    className="pl-3.5 py-1.5 my-2 border-l-2 border-purple-500 bg-purple-950/20 rounded-r-lg text-slate-300 italic"
                  >
                    {parseInline(trimmed.slice(2))}
                  </div>
                );
              }

              // Unordered lists
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-1 my-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                    <span className="flex-1">{parseInline(trimmed.slice(2))}</span>
                  </div>
                );
              }

              // Numbered lists
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-1 my-1">
                    <span className="text-purple-400 font-semibold font-mono text-xs mt-0.5 shrink-0 w-4">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1">{parseInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Horizontal rule
              if (trimmed === '---' || trimmed === '***') {
                return <hr key={lIdx} className="border-slate-800 my-3" />;
              }

              // Regular paragraph
              return (
                <p key={lIdx} className="text-slate-200">
                  {parseInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper for bold, italics, inline code
function parseInline(text: string): React.ReactNode {
  // Regex splitting inline code `code`, bold **text**, and italic *text*
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 bg-[#141b30] text-purple-300 rounded font-mono text-xs border border-purple-900/40"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
