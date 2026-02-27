# ResumeRound

**The gold standard for interview preparation.**

ResumeRound is a premium, voice-native AI interview preparation tool designed to help candidates excel in high-stakes interviews. Unlike generic mock interview platforms, ResumeRound utilizes advanced AI to conduct context-aware, JD-specific, and resume-driven "grill sessions."

## 🚀 The Problem
Existing interview prep tools often rely on scripted, generic questions that don't reflect the reality of modern technical or executive interviews. While LLMs like ChatGPT are excellent for text-based prep, they lack the low-latency, voice-native intelligence and deep document context required for a truly immersive mock interview.

## ✨ The Solution: ResumeRound
ResumeRound bridges the gap by providing a real-time, back-and-forth voice experience that feels like talking to a real human interviewer.

### Key Features
- **PDF Intelligence**: Our system parses your resume to verify claims and identify potential weaknesses.
- **Contextual Precision**: Every question is dynamically generated based on the specific Job Description you're applying for.
- **Voice-Native Interaction**: Powered by Gemini 2.5 Flash, the interview is a zero-latency audio experience. No typing, just talking.
- **Performance Audit**: Receive a comprehensive breakdown of your performance, including "Verified Strengths" and "Probe Zones"—the exact areas where a human interviewer would likely push harder.

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS 4, Motion (Framer Motion).
- **AI Engine**: Google Gemini API (`@google/genai`).
- **Models**:
  - `gemini-2.5-flash-native-audio-preview-09-2025`: For real-time, voice-to-voice interaction.
  - `gemini-3-flash-preview`: For deep text analysis, PDF parsing, and report generation.
- **Icons**: Lucide React.

## 🔄 Workflow
1. **Landing Page**: Explore the features and start your session.
2. **Setup**: Upload your Resume (PDF) and paste the target Job Description.
3. **Interview**: Engage in a 5-10 minute voice-native interview. The AI will introduce itself and ask probing questions based on your background.
4. **Report**: Get a detailed audit of your performance with actionable feedback.

## 🛠 Installation & Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up your environment variables (see `.env.example`).
4. Start the development server: `npm run dev`.

---
*Built for the future of career preparation.*
