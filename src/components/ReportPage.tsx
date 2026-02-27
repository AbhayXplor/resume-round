import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Loader2, RefreshCw, Activity, Zap } from 'lucide-react';
import { getGeminiClient } from '../lib/gemini';
import { LiveServerMessage } from '@google/genai';
import Markdown from 'react-markdown';

interface ReportPageProps {
  resumeText: string;
  jobDescription: string;
  messages: LiveServerMessage[];
  onRestart: () => void;
}

export default function ReportPage({ resumeText, jobDescription, messages, onRestart }: ReportPageProps) {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const generateReport = async () => {
      try {
        const ai = getGeminiClient();

        const transcriptLog = messages
          .map((m: any) => {
            if (m.serverContent?.modelTurn?.parts?.[0]?.text) return `Interviewer: ${m.serverContent.modelTurn.parts[0].text}`;
            if (m.inputTranscription?.text) return `Candidate: ${m.inputTranscription.text}`;
            return null;
          })
          .filter(Boolean)
          .join('\n');

        const prompt = `You are an expert interview coach. 
I am providing you with a candidate's resume, the job description they applied for, and the transcript of a voice interview session.

Resume:
${resumeText}

Job Description:
${jobDescription}

Interview Transcript:
${transcriptLog}

Analyze the conversation. Generate a detailed breakdown of the candidate's performance.
Do NOT use numerical scores. Provide written summaries only.

Format your response as clean Markdown with the following sections exactly:
## Verified Strengths
(Claims from the CV they defended well or demonstrated strong knowledge of)

## Weak Spots
(Claims or topics they stayed surface-level on, struggled with, or failed to elaborate on)

## Likely Probe Zones
(Areas a real human interviewer would likely push harder on based on this performance)

## Overall Readiness
(A summary of their readiness for the role)`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });

        if (isMounted) {
          setReport(response.text || 'Failed to generate report.');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Report Error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to generate report.');
          setLoading(false);
        }
      }
    };

    generateReport();

    return () => {
      isMounted = false;
    };
  }, [resumeText, jobDescription, messages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6">
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 border-4 border-zinc-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-zinc-900" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Auditing Performance</h2>
        <p className="text-zinc-400 text-sm font-medium">Our AI is dissecting your responses against the JD...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-8">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Audit Failed</h2>
          <p className="text-zinc-500 mb-10 text-sm leading-relaxed">{error}</p>
          <button
            onClick={onRestart}
            className="w-full bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all active:scale-95"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 p-6 lg:p-12 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-100 mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Analysis Complete</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Performance Audit</h1>
            <p className="text-zinc-400 text-lg max-w-xl">A comprehensive breakdown of your interview performance and strategic readiness.</p>
          </div>
          <button
            onClick={onRestart}
            className="flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            New Session
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-white border border-zinc-100 rounded-[2.5rem] p-10 lg:p-16 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 blur-[100px] rounded-full -mr-32 -mt-32 opacity-50" />
            <div className="markdown-body prose prose-zinc max-w-none prose-h2:text-2xl prose-h2:tracking-tight prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 first:prose-h2:mt-0 prose-p:text-zinc-500 prose-p:leading-relaxed prose-li:text-zinc-500">
              <Markdown>{report}</Markdown>
            </div>
          </motion.div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-zinc-900 text-white rounded-[2rem] p-8 shadow-xl">
              <h3 className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-6">Strategic Advice</h3>
              <p className="text-zinc-200 text-sm leading-relaxed mb-8">
                Focus on the "Probe Zones" in your next session. These are the areas where your technical depth was questioned by the AI.
              </p>
              <div className="h-px bg-white/10 mb-8" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold">Ready for Round 2?</span>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-[2rem] p-8">
              <h3 className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-6">Session Metrics</h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-medium">Resume Context</span>
                  <span className="font-bold text-zinc-900">{resumeText.length} chars</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-medium">JD Complexity</span>
                  <span className="font-bold text-zinc-900">High</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-medium">Turns Analyzed</span>
                  <span className="font-bold text-zinc-900">{messages.length}</span>
                </div>
                <div className="pt-4 border-t border-zinc-200/50">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <Activity className="w-3 h-3" />
                    System Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
