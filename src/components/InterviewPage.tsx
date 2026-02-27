import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Square, Activity, User, Bot, Volume2, Shield } from 'lucide-react';
import { getGeminiClient } from '../lib/gemini';
import { AudioRecorder, AudioPlayer } from '../lib/audio';
import { LiveServerMessage, Modality } from '@google/genai';

interface InterviewPageProps {
  resumeText: string;
  jobDescription: string;
  onComplete: (messages: LiveServerMessage[]) => void;
}

interface TranscriptItem {
  role: 'user' | 'model';
  text: string;
  id: string;
}

export default function InterviewPage({ resumeText, jobDescription, onComplete }: InterviewPageProps) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [status, setStatus] = useState<'speaking' | 'listening' | 'error'>('listening');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentModelText, setCurrentModelText] = useState('');
  const [currentUserText, setCurrentUserText] = useState('');

  const sessionRef = useRef<any>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const messagesRef = useRef<LiveServerMessage[]>([]);
  const timerRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, currentModelText, currentUserText]);

  useEffect(() => {
    let isMounted = true;

    const initInterview = async () => {
      try {
        const ai = getGeminiClient();

        playerRef.current = new AudioPlayer();

        const systemInstruction = `You are an elite executive interviewer. 
Context:
Resume: ${resumeText}
Job Description: ${jobDescription}

Your goal is to conduct a high-stakes, 5-minute interview. 
1. Start by introducing yourself briefly and asking a sharp, context-aware opening question.
2. Listen carefully to the candidate's response.
3. Push back on surface-level answers. If they claim a skill, ask for a specific, technical example.
4. If they stay vague, explicitly point it out and ask for more depth.
5. Be professional, slightly intimidating, but fair.
6. After about 5-6 questions, or if the user asks to end, wrap up the interview.
7. DO NOT use emojis. Keep it strictly professional.`;

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              if (!isMounted) return;
              
              recorderRef.current?.start().then(() => {
                if (!isMounted) return;
                setIsConnecting(false);
                setStatus('speaking');
                
                timerRef.current = window.setInterval(() => {
                  setTimer((prev) => prev + 1);
                }, 1000);
              }).catch((err) => {
                console.error('Microphone Error:', err);
                if (isMounted) {
                  setError('Microphone permission denied. Please allow microphone access to continue.');
                  setIsConnecting(false);
                }
              });
            },
            onmessage: (message: LiveServerMessage) => {
              if (!isMounted) return;
              messagesRef.current.push(message);

              // Handle User Transcription
              const msg = message as any;
              if (msg.inputTranscription?.text) {
                setCurrentUserText(prev => prev + msg.inputTranscription.text);
              }

              // Handle Model Turn
              if (message.serverContent?.modelTurn) {
                setStatus('speaking');
                const parts = message.serverContent.modelTurn.parts;
                for (const part of parts) {
                  if (part.inlineData && part.inlineData.data) {
                    playerRef.current?.play(part.inlineData.data);
                  }
                  if (part.text) {
                    setCurrentModelText(prev => prev + part.text);
                  }
                }
              }

              // Finalize turns into transcript list
              if (message.serverContent?.turnComplete) {
                setStatus('listening');
                if (currentUserText) {
                  setTranscripts(prev => [...prev, { role: 'user', text: currentUserText, id: Math.random().toString() }]);
                  setCurrentUserText('');
                }
                if (currentModelText) {
                  setTranscripts(prev => [...prev, { role: 'model', text: currentModelText, id: Math.random().toString() }]);
                  setCurrentModelText('');
                }
              }

              if (message.serverContent?.interrupted) {
                playerRef.current?.stop();
                setStatus('listening');
                if (currentModelText) {
                  setTranscripts(prev => [...prev, { role: 'model', text: currentModelText + ' [Interrupted]', id: Math.random().toString() }]);
                  setCurrentModelText('');
                }
              }
            },
            onerror: (err) => {
              console.error('Live API Error:', err);
              if (isMounted) setError('Connection error. Please try again.');
            },
            onclose: () => {
              console.log('Live API closed');
            },
          },
        });

        recorderRef.current = new AudioRecorder((base64) => {
          sessionPromise.then((session) => {
            session.sendRealtimeInput({
              media: { data: base64, mimeType: 'audio/pcm;rate=16000' },
            });
          });
        });

        sessionRef.current = await sessionPromise;
      } catch (err: any) {
        console.error('Init Error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to start interview.');
          setIsConnecting(false);
        }
      }
    };

    initInterview();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stop();
      playerRef.current?.stop();
      if (sessionRef.current) {
        try {
          sessionRef.current.close();
        } catch (e) {}
      }
    };
  }, [resumeText, jobDescription]);

  const handleEndInterview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
    playerRef.current?.stop();
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {}
    }
    onComplete(messagesRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-8 animate-pulse">
          <Mic className="w-8 h-8 text-zinc-300" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Establishing Secure Link</h2>
        <p className="text-zinc-400 text-sm">Calibrating voice-native intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-8">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Session Interrupted</h2>
          <p className="text-zinc-500 mb-10 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all active:scale-95"
          >
            Retry Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-sm">Live Session</div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'speaking' ? 'bg-zinc-900 animate-pulse' : 'bg-zinc-300'}`} />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {status === 'speaking' ? 'Interviewer Speaking' : 'Listening'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="font-mono text-xl font-bold text-zinc-900 tabular-nums">
            {formatTime(timer)}
          </div>
          <button
            onClick={handleEndInterview}
            className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-bold text-[12px] transition-all active:scale-95 shadow-sm hover:bg-zinc-800"
          >
            End Session
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Visualizer Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 relative border-b lg:border-b-0 lg:border-r border-zinc-100">
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
               style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{
                scale: status === 'speaking' ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-48 h-48 rounded-[3rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-inner mb-12"
            >
              <div className="flex gap-1.5 items-center justify-center h-12">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-zinc-900 rounded-full"
                    animate={{
                      height: status === 'speaking' ? [12, 48, 20, 40, 12] : 4,
                      opacity: status === 'speaking' ? 1 : 0.2,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900">
                  {status === 'speaking' ? 'Interviewer is speaking...' : 'Your turn to respond'}
                </h3>
                <p className="text-zinc-400 text-sm font-medium">
                  {status === 'speaking' ? 'Listen carefully to the question' : 'Speak clearly into your microphone'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Transcript Area */}
        <div className="w-full lg:w-[450px] bg-zinc-50/50 flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100 bg-white">
            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Live Transcript
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            {transcripts.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: item.role === 'model' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${item.role === 'model' ? 'items-start' : 'items-end'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm border ${
                  item.role === 'model' 
                    ? 'bg-white border-zinc-100 text-zinc-900 rounded-tl-none' 
                    : 'bg-zinc-900 border-zinc-800 text-white rounded-tr-none'
                }`}>
                  {item.text}
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 px-1">
                  {item.role === 'model' ? 'AI Interviewer' : 'You'}
                </span>
              </motion.div>
            ))}
            
            {/* Current Turn Streaming */}
            {currentUserText && (
              <div className="flex flex-col items-end">
                <div className="max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-medium bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-tr-none italic">
                  {currentUserText}...
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 px-1">
                  Transcribing...
                </span>
              </div>
            )}
            
            {currentModelText && (
              <div className="flex flex-col items-start">
                <div className="max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-medium bg-white border border-zinc-100 text-zinc-400 rounded-tl-none italic">
                  {currentModelText}...
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 px-1">
                  AI Speaking...
                </span>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
