import { useState } from 'react';
import LandingPage from './components/LandingPage';
import SetupPage from './components/SetupPage';
import InterviewPage from './components/InterviewPage';
import ReportPage from './components/ReportPage';
import { LiveServerMessage } from '@google/genai';

type AppState = 'landing' | 'setup' | 'interview' | 'report';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [messages, setMessages] = useState<LiveServerMessage[]>([]);

  const handleStartSetup = () => {
    setAppState('setup');
  };

  const handleSetupComplete = (resume: string, jd: string) => {
    setResumeText(resume);
    setJobDescription(jd);
    setAppState('interview');
  };

  const handleInterviewComplete = (interviewMessages: LiveServerMessage[]) => {
    setMessages(interviewMessages);
    setAppState('report');
  };

  const handleRestart = () => {
    setResumeText('');
    setJobDescription('');
    setMessages([]);
    setAppState('landing');
  };

  return (
    <>
      {appState === 'landing' && <LandingPage onStart={handleStartSetup} />}
      {appState === 'setup' && <SetupPage onComplete={handleSetupComplete} />}
      {appState === 'interview' && (
        <InterviewPage
          resumeText={resumeText}
          jobDescription={jobDescription}
          onComplete={handleInterviewComplete}
        />
      )}
      {appState === 'report' && (
        <ReportPage
          resumeText={resumeText}
          jobDescription={jobDescription}
          messages={messages}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
