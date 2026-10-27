# ABi AI — College Study Assistant & AI Chatbot 🎓✨

**ABi AI** is a production-grade, mobile-friendly AI study companion designed specifically for university and college students. Powered by Google Gemini (`gemini-3.8-flash`), it combines conversational academic mentorship, high-density text summarization, interactive quiz generation, and active-recall flashcards with persistent chat history.

Built with a modern **dark blue and purple aesthetic** inspired by nocturnal deep-work study sessions, and engineered with touch-first thumb ergonomics for Android and mobile devices.

---

## 🌟 Key Features

1. **AI Chatbot Powered by Gemini 3.8 Flash**:
   - Specialized collegiate study modes:
     - 🧠 **Feynman Explainer**: Deconstructs complex theories into intuitive analogies, underlying mechanics, and pitfalls.
     - 📐 **Problem Solver**: Step-by-step derivations and sanity checks for STEM problems.
     - ✍️ **Essay & Thesis Coach**: Thesis statement brainstorming, argumentative outlines, and scholarly critiques.
     - 🎯 **Exam Cram**: High-yield formulas, mnemonics, and likely midterm/final exam traps.
   - Formatted with clean Markdown, mathematical formulas, and code snippets with one-click copy.
   - Quick starter prompt chips for instant assistance.

2. **Academic Text Summarizer**:
   - Summarizes long syllabi, lecture transcripts, and research articles.
   - Four distinct academic output formats:
     - **Key Takeaways**: Bulleted core findings and takeaways.
     - **Executive Summary**: 1-minute high-density academic brief.
     - **Concept Glossary**: Alphabetized terms, definitions, and contextual significance.
     - **Exam Cheat Sheet**: Formulas, theorems, and potential test questions.
   - Quantitative reading metrics: word count compression percentage and minutes saved.
   - One-click workflow: Send summary directly into Quiz Generator or discuss in Chat.

3. **Interactive Quiz Generator**:
   - Creates college-level multiple-choice questions from any topic or pasted lecture notes.
   - Configurable difficulty: 101 Intro, Mid-Level (Sophomore/Junior), or Advanced (Senior/Grad).
   - Interactive mobile-friendly tap cards ($\ge 48\text{px}$ touch targets).
   - Real-time answer validation: Immediate color-coded feedback with deep pedagogical explanations explaining *why* the correct answer is right and dissecting common distractor traps.
   - Celebratory score evaluation and question-by-question review.

4. **Study Hub & Active Recall Flashcards**:
   - 3D flip card viewer for rapid active recall.
   - Custom flashcard deck generator powered by Gemini.
   - Pre-built college study toolkits for rapid session launch.

5. **Chat History & Session Management**:
   - Persistent storage in `localStorage` across page reloads.
   - Auto-generated session titles, message counts, and timestamps.
   - Inline rename, delete session, and clear all history.
   - One-click **Markdown (.md) Export** to save notes to your computer or drive.

6. **Responsive Touch-First Design for Mobile & Android**:
   - Fixed bottom tab bar (`h-16`) optimized for natural one-handed thumb reach.
   - Slide-over drawer for chat history and study tool navigation.
   - Prevents zoom disruption on mobile input focus (`16px` inputs).
   - Zero-pill metadata design with high-contrast WCAG AA readability.

7. **Secure API Key Handling**:
   - Fully full-stack architecture: all `@google/genai` calls happen server-side inside `server.ts` (Express).
   - `GEMINI_API_KEY` is never exposed to client-side bundles or browser requests.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TSX, Dotenv.
- **AI Engine**: `@google/genai` SDK with `gemini-3.8-flash`.

---

## 🚀 GitHub Setup & Local Run Instructions

### 1. Prerequisites
- **Node.js**: Version 20.x or higher (recommended: LTS 20 or 22).
- **npm** or **yarn**: Comes bundled with Node.js.
- **Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/).

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/abi-ai.git
cd abi-ai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```bash
cp .env.example .env
```
Open `.env` and insert your Gemini API Key:
```env
GEMINI_API_KEY="your-actual-gemini-api-key-here"
PORT=3000
NODE_ENV=development
```

### 5. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```
In development, Express runs on port 3000 with Vite middleware mounted automatically, giving you instant Hot Module Replacement and backend API routing together!

---

## 📦 Building and Deploying to Production

### 1. Build the Application
```bash
npm run build
```
This compiles the React SPA into static assets in the `/dist` directory.

### 2. Run the Production Server
```bash
npm start
```
The Express server will serve the optimized production files from `/dist` and handle all `/api/*` endpoints.

---

## ☁️ Deployment Guides

### Option A: Google Cloud Run (Recommended)
1. Ensure your project has a `Dockerfile`:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["npm", "start"]
```
2. Build and deploy to Cloud Run:
```bash
gcloud run deploy abi-ai \
  --source . \
  --port 3000 \
  --set-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY \
  --allow-unauthenticated
```

### Option B: Render / Railway / Heroku
1. Connect your GitHub repository.
2. Set Build Command: `npm install && npm run build`
3. Set Start Command: `npm start`
4. Add Environment Variable: `GEMINI_API_KEY` in your dashboard's Secrets settings.

---

## 📁 Project Structure

```
├── .env.example              # Template environment variables
├── index.html                # HTML entry point with font preloads
├── metadata.json             # AI Studio app metadata
├── package.json              # App scripts and dependencies
├── server.ts                 # Full-stack Express server with Gemini SDK routes
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite & Tailwind CSS plugins
├── src/
│   ├── main.tsx              # React DOM entry point
│   ├── App.tsx               # Root application state & navigation router
│   ├── index.css             # Tailwind v4 theme, fonts, custom glow utilities
│   ├── types.ts              # TypeScript interfaces (Chat, Quiz, Flashcards, Subjects)
│   ├── services/
│   │   └── api.ts            # Typed client API services for /api routes
│   ├── utils/
│   │   └── storage.ts        # LocalStorage session manager & Markdown exporter
│   └── components/
│       ├── Header.tsx        # Top navigation bar (3-zone contract)
│       ├── BottomNavBar.tsx  # Android touch-ergonomic bottom tab bar
│       ├── ChatView.tsx      # Main AI Chatbot with study modes & prompt chips
│       ├── SummarizerView.tsx# Academic text summarizer & metric calculations
│       ├── QuizView.tsx      # Interactive MCQ quiz player & review
│       ├── StudyHubView.tsx  # Active recall 3D flashcards & study toolkits
│       ├── ChatHistoryDrawer.tsx # Slide-over history drawer with rename & export
│       └── MarkdownRenderer.tsx  # Highlighting & code block copy parser
```

---

## 🛡️ Security & Privacy

- **Zero Client-Side API Key Exposure**: All calls to `@google/genai` are executed in `server.ts`. The browser never has access to `GEMINI_API_KEY`.
- **Private Local Storage**: Study notes and chats are stored locally in your browser's `localStorage` unless explicitly exported by you.

---

## 📄 License

Licensed under the Apache-2.0 License.
