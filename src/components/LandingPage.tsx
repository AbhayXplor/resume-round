import { motion } from 'motion/react';
import { Mic, FileText, Activity, ArrowRight, Shield, Zap, Target, Globe, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white overflow-x-hidden">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Nav */}
        <nav className="flex justify-between items-center py-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center shadow-sm">
              <Mic className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ResumeRound</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-500">
              <a href="#features" className="hover:text-zinc-900 transition-colors">Product</a>
              <a href="#methodology" className="hover:text-zinc-900 transition-colors">Methodology</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">Enterprise</a>
            </div>
            <button
              onClick={onStart}
              className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 mb-8">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">v2.0 Now Live</span>
              <ChevronRight className="w-3 h-3 text-zinc-400" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8 text-zinc-900">
              The gold standard for <br />
              <span className="text-zinc-400">interview preparation.</span>
            </h1>
            <p className="text-xl text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed font-normal">
              High-fidelity voice simulations that dissect your CV and target role. Built for candidates who don't leave their career to chance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStart}
                className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 active:scale-95"
              >
                Start Free Session
              </button>
              <button className="w-full sm:w-auto bg-white text-zinc-600 border border-zinc-200 px-8 py-4 rounded-xl font-bold text-base hover:bg-zinc-50 transition-all active:scale-95">
                Book a Demo
              </button>
            </div>
          </motion.div>

          {/* Product Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden p-4">
              <div className="aspect-video bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
                  <Activity className="w-64 h-64 text-zinc-900" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-xl border border-zinc-100 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-zinc-900" />
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="text-sm font-bold text-zinc-900 tracking-tight uppercase">AI Interviewer Active</div>
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4].map(i => (
                        <motion.div 
                          key={i} 
                          className="w-1.5 h-4 bg-zinc-900 rounded-full"
                          animate={{ height: [10, 24, 12, 20, 10] }}
                          transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating UI Elements */}
            <div className="absolute -right-8 top-1/4 hidden lg:block">
              <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xl max-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">JD Match</span>
                </div>
                <div className="text-sm font-bold text-zinc-900">"Explain your role in the Q3 migration..."</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 border-t border-zinc-100">
          <div className="grid md:grid-cols-3 gap-16">
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-zinc-900">Zero-Latency Voice</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Experience fluid, natural conversations with near-instant response times powered by Gemini 2.5 Flash.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-zinc-900">Contextual Precision</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Our AI cross-references your resume with the job description to identify specific claims and probe for depth.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-zinc-900">Readiness Audit</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Receive a professional-grade audit highlighting verified strengths and areas where you stayed surface-level.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">ResumeRound</span>
          </div>
          <div className="flex gap-10 text-zinc-400 text-[13px] font-medium">
            <a href="#" className="hover:text-zinc-900 transition-colors">Product</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Twitter</a>
          </div>
          <p className="text-zinc-400 text-[13px]">© 2026 ResumeRound Inc.</p>
        </footer>
      </div>
    </div>
  );
}
