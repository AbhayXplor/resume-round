import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, FileText, Loader2, ArrowRight } from 'lucide-react';
import { getGeminiClient } from '../lib/gemini';

interface SetupPageProps {
  onComplete: (resumeText: string, jobDescription: string) => void;
}

export default function SetupPage({ onComplete }: SetupPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const ai = getGeminiClient();
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
              {
                inlineData: {
                  data: base64,
                  mimeType: 'application/pdf',
                },
              },
              'Extract all text from this resume. Output only the text, maintaining structure where possible.',
            ],
          });
          resolve(response.text || '');
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload your resume.');
      return;
    }
    if (!jd.trim()) {
      setError('Please paste the job description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resumeText = await extractTextFromPdf(file);
      if (!resumeText) throw new Error('Could not extract text from PDF.');
      onComplete(resumeText, jd);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex items-center justify-center p-6 selection:bg-zinc-900 selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl p-10 md:p-14 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 mb-6">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Configuration</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-zinc-900">Initialize Session.</h2>
          <p className="text-zinc-500 text-base">Provide your context to calibrate the AI interviewer.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </motion.div>
        )}

        <div className="space-y-10 relative z-10">
          {/* Resume Upload */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4">
              1. Professional Resume
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`group border border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
                file ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400 bg-white'
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <span className="block font-bold text-zinc-900">{file.name}</span>
                    <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="block font-bold text-zinc-600">Upload CV</span>
                    <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">PDF format only</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4">
              2. Target Job Description
            </label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the role requirements..."
              className="w-full h-40 bg-white border border-zinc-200 rounded-xl p-5 text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-all resize-none font-medium leading-relaxed text-sm"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full group relative bg-zinc-900 text-white px-8 py-4.5 rounded-xl font-bold text-base hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-zinc-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Calibrating...</span>
              </>
            ) : (
              <>
                <span>Initialize Interview</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
