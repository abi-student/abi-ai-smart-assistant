import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Helper to check API Key
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient model caller: tries gemini-3.8-flash with a fast fallback to gemini-3.5-flash for snappy response
async function generateWithFallback(ai: GoogleGenAI, requestConfig: any) {
  const tryModel = async (modelName: string) => {
    return await ai.models.generateContent({
      ...requestConfig,
      model: modelName,
    });
  };

  try {
    // Race gemini-3.8-flash against a 4-second timer; if it exceeds, fallback to gemini-3.5-flash for snappy response
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('MODEL_TIMEOUT')), 4000)
    );

    return await Promise.race([tryModel('gemini-3.8-flash'), timeoutPromise]);
  } catch (error: any) {
    console.warn(`[ABi AI] Switching to gemini-3.5-flash (${error?.message || 'timeout/fallback'})`);
    return await tryModel('gemini-3.5-flash');
  }
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'ABi AI',
    model: 'gemini-3.8-flash',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Download Project ZIP endpoint for easy mobile export
app.get('/api/download-zip', (req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'abi-ai-project.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'abi-ai-project.zip');
  } else {
    res.status(404).json({ error: 'ZIP file not found' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, studyMode, subject } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required and must not be empty.' });
      return;
    }

    const ai = getGeminiClient();

    // Map system instruction based on study mode
    let modeInstruction = '';
    if (studyMode === 'feynman') {
      modeInstruction = 'Explain concepts using the Feynman Technique: start with a crystal-clear intuitive real-world analogy, then explain the technical college-level mechanisms, highlight common misconceptions, and finish with a check-for-understanding question.';
    } else if (studyMode === 'problem_solver') {
      modeInstruction = 'Act as a step-by-step problem solver for STEM or humanities. Break every problem down into: 1. Given info & Core objective, 2. Formula/Key Principle, 3. Step-by-step derivation with reasoning, 4. Final verification & common errors to avoid.';
    } else if (studyMode === 'essay_coach') {
      modeInstruction = 'Act as a collegiate academic writing coach. Help formulate strong thesis statements, evaluate evidence, structure essay outlines, enhance scholarly vocabulary, and provide constructive line-by-line feedback with APA/MLA conventions.';
    } else if (studyMode === 'exam_prep') {
      modeInstruction = 'Act as an intensive exam cram & revision partner. Focus on high-yield test topics, likely exam questions, memory mnemonics, quick-reference formulas, and strategic exam-day time management.';
    }

    const systemInstruction = `You are ABi AI, a collegiate study assistant and intellectual mentor built specifically for university students.
Your mission is to help students learn faster, master difficult coursework, prepare for exams, and write top-tier papers.
Subject Context: ${subject ? subject : 'General Collegiate Studies'}.
${modeInstruction}

Guidelines:
- Format your response clearly with Markdown (bold headings, bullet lists, step-by-step numbered points, and clean syntax-highlighted code blocks where applicable).
- Keep your tone supportive, highly knowledgeable, and academically rigorous without being overly verbose.
- If asked mathematical or chemical equations, use clean LaTeX or Unicode formatting.
- If the user is confused, offer a simpler intuitive mental model.
- At the end of major explanations, provide a 1-sentence "Quick Recall Summary" or a thought-provoking practice query.`;

    // Format contents for Gemini SDK
    // Convert incoming message objects { role: 'user' | 'assistant' | 'model', content: string }
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await generateWithFallback(ai, {
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I could not generate a response. Please try rephrasing your question.';
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate response. Please check your Gemini API connection.',
    });
  }
});

// Text Summarizer endpoint
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const { text, format = 'bullets', length = 'medium', subject } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text to summarize is required.' });
      return;
    }

    const ai = getGeminiClient();

    let formatPrompt = '';
    switch (format) {
      case 'bullets':
        formatPrompt = 'Format as a high-density bulleted list of essential arguments, key findings, and core takeaways. Group logically under 2-4 clean topical section headings.';
        break;
      case 'executive':
        formatPrompt = 'Format as a 1-to-2 minute Executive Academic Summary: An opening thesis sentence, a coherent cohesive body paragraph synthesizing all main points, and an ending conclusion with implications.';
        break;
      case 'glossary':
        formatPrompt = 'Extract all critical terms, concepts, formulas, and people mentioned. Present them as an alphabetical glossary: **Term**: Precise college-level definition and why it matters in this context.';
        break;
      case 'study_sheet':
        formatPrompt = 'Format as a midterm/final exam "Cheat Sheet": Key Formulas/Theorems, 5 Must-Know Concepts, Common Trap Pitfalls, and 3 Potential Exam Questions with brief answers.';
        break;
      default:
        formatPrompt = 'Format with key takeaways and clear thematic breakdown.';
    }

    let lengthInstruction = '';
    if (length === 'short') {
      lengthInstruction = 'Be extremely concise and high-yield (approx 150-250 words total). Cut all fluff.';
    } else if (length === 'detailed') {
      lengthInstruction = 'Provide a thorough, comprehensive academic breakdown (approx 500-750 words). Include supporting nuances and context.';
    } else {
      lengthInstruction = 'Balanced standard study length (approx 300-450 words).';
    }

    const prompt = `Please summarize the following college course text/lecture notes.
Subject context: ${subject || 'Higher Education'}.
Target Format: ${formatPrompt}
Target Length: ${lengthInstruction}

Text to analyze:
"""
${text}
"""

Also provide a short 1-line headline summarizing the document's central thesis.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert academic research summarizer for university students. Extract maximum insight with zero filler.',
        temperature: 0.3,
      },
    });

    const summaryText = response.text || 'Unable to generate summary.';
    
    // Quick statistics
    const originalWords = text.trim().split(/\s+/).filter(Boolean).length;
    const summaryWords = summaryText.trim().split(/\s+/).filter(Boolean).length;
    const reductionPercent = originalWords > 0 ? Math.max(0, Math.round(((originalWords - summaryWords) / originalWords) * 100)) : 0;
    const readingTimeMinutes = Math.max(1, Math.ceil(originalWords / 200));
    const savedTimeMinutes = Math.max(0, Math.ceil((originalWords - summaryWords) / 200));

    res.json({
      summary: summaryText,
      stats: {
        originalWords,
        summaryWords,
        reductionPercent,
        readingTimeMinutes,
        savedTimeMinutes,
      },
    });
  } catch (error: any) {
    console.error('Summarize API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to summarize text.',
    });
  }
});

// Quiz Generator endpoint
app.post('/api/quiz', async (req: Request, res: Response) => {
  try {
    const { topic, content, questionCount = 5, difficulty = 'intermediate', subject } = req.body;

    if (!topic && !content) {
      res.status(400).json({ error: 'Please provide either a topic name or course content to generate a quiz.' });
      return;
    }

    const ai = getGeminiClient();

    const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 3), 10);

    const prompt = `Create an interactive college-level multiple choice quiz with exactly ${count} questions.
Topic / Focus: ${topic || 'Course Notes'}
Academic Subject: ${subject || 'Collegiate Studies'}
Difficulty: ${difficulty} (beginner = freshman 101 level, intermediate = sophomore/junior level, advanced = senior/graduate seminar level).

${content ? `Source notes/text:\n"""\n${content.slice(0, 8000)}\n"""` : ''}

Generate challenging, realistic questions that test conceptual understanding, synthesis, and application (not just trivia).
Each question must have exactly 4 choices (index 0, 1, 2, 3), one unambiguously correct choice, and a thorough pedagogical explanation explaining why the correct answer is right and why the distractors are wrong.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an experienced college professor and quiz architect. Generate balanced, high-yield academic assessment questions in strict JSON format.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING, description: 'Descriptive title of the quiz' },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING, description: 'The question text' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 distinct choices',
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: 'Zero-based index of correct option (0, 1, 2, or 3)',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'College-level explanation of the answer and distractor rationale',
                  },
                  conceptTag: {
                    type: Type.STRING,
                    description: 'Specific sub-concept or topic tag',
                  },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'conceptTag'],
              },
            },
          },
          required: ['quizTitle', 'topic', 'difficulty', 'questions'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.json(parsedJson);
  } catch (error: any) {
    console.error('Quiz API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate quiz.',
    });
  }
});

// Flashcard Generator endpoint
app.post('/api/flashcards', async (req: Request, res: Response) => {
  try {
    const { topic, notes, count = 6, subject } = req.body;

    if (!topic && !notes) {
      res.status(400).json({ error: 'Please provide a topic or notes.' });
      return;
    }

    const ai = getGeminiClient();
    const cardCount = Math.min(Math.max(parseInt(count, 10) || 6, 4), 12);

    const prompt = `Create ${cardCount} high-retention active recall study flashcards for a college student.
Topic: ${topic || 'Key Study Material'}
Subject: ${subject || 'General'}
${notes ? `Notes:\n"""${notes.slice(0, 6000)}"""` : ''}

Make the front prompt test deep understanding (definitions, core mechanisms, contrast between two terms, or problem scenario).
Make the back concise, bulleted where needed, and provide an optional memory mnemonic or key takeaway tip.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING, description: 'Question or core prompt on front of card' },
                  back: { type: Type.STRING, description: 'Clear comprehensive explanation on back' },
                  category: { type: Type.STRING, description: 'Short topic subcategory' },
                  tip: { type: Type.STRING, description: 'Short memory tip or mnemonic' },
                },
                required: ['id', 'front', 'back', 'category'],
              },
            },
          },
          required: ['title', 'cards'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Flashcards API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate flashcards.',
    });
  }
});

// Setup dev server with Vite middlewares or serve production dist
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ABi AI] Server is running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
