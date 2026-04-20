import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Mic, Send, RotateCcw, CheckCircle2, AlertCircle, 
  ChevronRight, Brain, Globe, Building2, Terminal, MessageSquare, 
  Sparkles, Loader2, Volume2, User, Trophy, Lightbulb, ChevronDown, ChevronUp,
  Award, Calendar, Phone, PhoneOff, Waves, Settings, X, Play, Sliders
} from 'lucide-react';
import { callAIStream } from '../utils/openai';
import { playSound } from '../utils/sounds';

// Simple Markdown component to handle bold, code, and lists without external libs
const MarkdownText = ({ content, className = "" }) => {
  if (!content) return null;

  const lines = content.split('\n');
  
  return (
    <div className={`space-y-4 ${className}`}>
      {lines.map((line, idx) => {
        let processedLine = line;
        
        // Handle bold: **text** -> <strong>text</strong>
        const parts = [];
        let lastIndex = 0;
        const boldRegex = /\*\*(.*?)\*\*/g;
        let match;
        
        while ((match = boldRegex.exec(processedLine)) !== null) {
          if (match.index > lastIndex) {
            parts.push(processedLine.substring(lastIndex, match.index));
          }
          parts.push(<strong key={match.index} className="font-extrabold text-indigo-600 dark:text-indigo-400">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        
        if (lastIndex < processedLine.length) {
          parts.push(processedLine.substring(lastIndex));
        }

        // Handle simple lists: - item -> <li>item</li>
        if (processedLine.trim().startsWith('- ')) {
          return (
            <div key={idx} className="flex gap-3 ml-2 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
              <p className="text-inherit">{parts.length > 0 ? parts : processedLine.substring(2)}</p>
            </div>
          );
        }

        return <p key={idx} className="text-inherit leading-relaxed">{parts.length > 0 ? parts : processedLine}</p>;
      })}
    </div>
  );
};

const COMPANIES = [
  {
    id: 'nab',
    name: 'NAB (National Australia Bank)',
    description: 'Enterprise Java, Microservices, Spring Boot, AWS integration.',
    color: 'from-red-500 to-rose-600',
    accent: 'rose',
    focus: ['Spring Boot', 'Kafka', 'Microservices', 'Unit Testing']
  },
  {
    id: 'epam',
    name: 'Epam Systems',
    description: 'Global consultancy. Java Core, Design Patterns, Multithreading.',
    color: 'from-sky-500 to-indigo-600',
    accent: 'sky',
    focus: ['Java Core', 'Collections', 'Concurrency', 'Design Patterns']
  },
  {
    id: 'wordquant',
    name: 'Wordquant',
    description: 'Fintech/Trading. Algorithms, JVM performance, low-level Java.',
    color: 'from-emerald-500 to-teal-600',
    accent: 'emerald',
    focus: ['Algorithms', 'Data Structures', 'Performance', 'Garbage Collection']
  },
  {
    id: 'employee-hero',
    name: 'Employee Hero',
    description: 'Modern HR Platform. Scalability, Agile, Full-stack Java/Node.',
    color: 'from-amber-500 to-orange-600',
    accent: 'amber',
    focus: ['System Design', 'Agile', 'API Development', 'Modern Java']
  }
];

const DAILY_QUESTIONS = [
  {
    question: "How do you ensure data consistency in a microservices architecture when multiple services need to update their own databases?",
    recommendation: "Mention the **Saga Pattern** or **Two-Phase Commit (2PC)**. Explain the trade-offs between orchestration and choreography.",
    example: "In microservices, I typically use the **Saga Pattern** (specifically choreography) for eventual consistency. For each local transaction, the service emits an event that triggers the next service. If one step fails, I implement compensating transactions to rollback the state manually."
  },
  {
    question: "Explain the difference between Optimistic and Pessimistic locking in Java/JPA and when you would use each.",
    recommendation: "Focus on the `@Version` annotation for Optimistic and `LockModeType.PESSIMISTIC_WRITE` for Pessimistic. Mention performance impacts.",
    example: "I use **Optimistic Locking** for most cases where conflict is rare, as it doesn't hold DB locks and uses a version column. For high-contention scenarios, like decrementing a product stock during a flash sale, I use **Pessimistic Locking** to prevent concurrent updates at the database level."
  },
  {
    question: "What is a 'Circuit Breaker' in the context of Java Spring Boot, and why did you use it in your last project?",
    recommendation: "Mention **Resilience4j** or **Hystrix**. Explain the states: Closed, Open, and Half-Open.",
    example: "I used **Resilience4j** to prevent cascading failures when an external Payment Gateway was slow. The Circuit Breaker 'opens' after a failure threshold, allowing our system to return a 'Service Unavailable' response immediately to the user instead of letting threads hang."
  },
  {
    question: "Can you explain how Java's Garbage Collection works, specifically the G1 Garbage Collector?",
    recommendation: "Mention Heap regions, Young Generation (Eden/Survivor), Old Generation, and the 'Stop-the-world' event.",
    example: "The **G1 (Garbage First)** collector partitions the heap into equal-sized regions. It prioritizes collecting regions with the most garbage first to meet a user-defined pause time goal. It's more predictable than the older CMS collector for large heaps."
  },
  {
    question: "How do you handle Spring Bean circular dependencies?",
    recommendation: "Mention architectural redesign, `@Lazy`, or Setter Injection. Explain why Constructor Injection is better for detecting them.",
    example: "Circular dependencies are usually a sign of tight coupling. I first try to refactor by extracting the common logic into a third bean. If refactoring isn't possible, I use the **@Lazy** annotation on one of the dependency injections to break the initialization cycle."
  }
];

const InterviewPrep = () => {
  const [stage, setStage] = useState('selection');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [isRealtimeMode, setIsRealtimeMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({ rate: 1.0, pitch: 1.0 });
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load voices and select default
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      if (!selectedVoiceName && voices.length > 0) {
        // Preference: Google US -> Samantha -> David -> any US English
        const preferred = voices.find(v => v.name.includes('Google') && v.lang.includes('en-US')) ||
                         voices.find(v => v.name.includes('Samantha') && v.lang.includes('en-US')) ||
                         voices.find(v => v.name.includes('David') && v.lang.includes('en-US')) ||
                         voices.find(v => v.lang.includes('en-US')) ||
                         voices[0];
        setSelectedVoiceName(preferred.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceName]);

  // Clean up recognition and speech on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = useCallback((text, callback) => {
    if (!text) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    
    const voice = availableVoices.find(v => v.name === selectedVoiceName);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
  }, [availableVoices, selectedVoiceName, voiceSettings]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    if (recognitionRef.current) recognitionRef.current.stop();

    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true; // IMPORTANT: Real-time feedback
    recognition.continuous = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };
    
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      if (interim) {
        setInterimTranscript(interim);
      }
      
      if (final) {
        setInput(final);
        setInterimTranscript('');
        // Automatic send if in realtime mode and high confidence
        if (isRealtimeMode) {
          handleSend(final);
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.error('STT Error:', event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [isRealtimeMode]);

  const startInterview = (company, mode = false) => {
    setSelectedCompany(company);
    setStage('interview');
    setIsDailyChallenge(false);
    setIsRealtimeMode(mode);
    playSound('select');
    
    const initialQuestion = "Can you introduce yourself and tell me about a complex Java project you've worked on recently?";
    const initialMessage = {
      role: 'assistant',
      content: `Hello! I'm your interviewer from **${company.name}**. Today we'll talk about your experience as a Java Engineer. Let's start:\n\n**${initialQuestion}**`,
      question: initialQuestion,
      recommendation: "Focus on your role, the technologies used (Spring Boot, etc.), and the specific problem you solved. Use the STAR method.",
      example: "Sure! I'm a Java Engineer with 3 years of experience. Recently, I built a microservice using **Spring Boot 3** and **Kafka** to process real-time payments. One complex challenge was handling message idempotency, which I solved by implementing a Deduplication Strategy using Redis.",
      showRecommendation: false
    };
    setMessages([initialMessage]);

    if (mode) {
      setTimeout(() => {
        speakText(`Hello! I'm your interviewer from ${company.name}. Today we'll talk about your experience as a Java Engineer. Let's start. ${initialQuestion}`, () => {
          startListening();
        });
      }, 1000);
    }
  };

  const handleDailyChallenge = () => {
    const today = new Date();
    const index = today.getDate() % DAILY_QUESTIONS.length;
    const daily = DAILY_QUESTIONS[index];
    
    setSelectedCompany({ name: "Daily Challenge Panel", id: 'daily' });
    setStage('interview');
    setIsDailyChallenge(true);
    setIsRealtimeMode(false);
    playSound('success');
    
    const initialMessage = {
      role: 'assistant',
      content: `Welcome to your **Daily Java Interview Challenge**! I'm here to push your technical bounds and English fluency. Here is your question for today:\n\n**${daily.question}**`,
      question: daily.question,
      recommendation: daily.recommendation,
      example: daily.example,
      showRecommendation: false
    };
    setMessages([initialMessage]);
  };

  const resetInterview = () => {
    setStage('selection');
    setSelectedCompany(null);
    setMessages([]);
    setInput('');
    setIsDailyChallenge(false);
    setIsRealtimeMode(false);
    window.speechSynthesis.cancel();
    playSound('click');
  };

  const toggleRecommendation = (index) => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[index] = { ...newMessages[index], showRecommendation: !newMessages[index].showRecommendation };
      return newMessages;
    });
    playSound('click');
  };

  const parseAIResponse = (text) => {
    const feedbackMatch = text.match(/\[FEEDBACK\]([\s\S]*?)(?=\[RECOMMENDATION\]|\[EXAMPLE\]|\[QUESTION\]|$)/i);
    const recommendationMatch = text.match(/\[RECOMMENDATION\]([\s\S]*?)(?=\[EXAMPLE\]|\[QUESTION\]|$)/i);
    const exampleMatch = text.match(/\[EXAMPLE\]([\s\S]*?)(?=\[QUESTION\]|$)/i);
    const questionMatch = text.match(/\[QUESTION\]([\s\S]*?)$/i);

    return {
      feedback: feedbackMatch ? feedbackMatch[1].trim() : '',
      recommendation: recommendationMatch ? recommendationMatch[1].trim() : '',
      example: exampleMatch ? exampleMatch[1].trim() : '',
      question: questionMatch ? questionMatch[1].trim() : text
    };
  };

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setInterimTranscript('');
    setIsLoading(true);
    playSound('click');

    let currentFullContent = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', isLoading: true }]);

    const systemPrompt = `You are a Senior Java Technical Interviewer at ${selectedCompany?.name} in Hanoi.
    The user is applying for a Java Engineer position.
    Your goal is to conduct a mock interview in English.
    
    IMPORTANT: You MUST respond in four clear blocks:
    [FEEDBACK] -> Evaluate their technical answer and their English (grammar/fluency). Be concise.
    [RECOMMENDATION] -> A short hint or tip for them to answer THIS TYPE of question better next time.
    [EXAMPLE] -> A perfect, concise example answer in English that high-level engineers would give.
    [QUESTION] -> Ask the next technical question related to ${selectedCompany?.id === 'daily' ? 'General Advanced Java' : selectedCompany?.focus.join(', ')}.
    
    Use markdown (e.g., **bold**, - lists) within these blocks for professional formatting.`;

    try {
      const chatHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const fullPrompt = `${systemPrompt}\n\nChat history:\n${chatHistory}\nUser: ${text}`;

      await callAIStream(fullPrompt, (chunk) => {
        currentFullContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          const parsed = parseAIResponse(currentFullContent);
          
          newMessages[newMessages.length - 1] = { 
            ...lastMsg,
            role: 'assistant', 
            content: currentFullContent,
            ...parsed,
            isLoading: false 
          };
          return newMessages;
        });
      });

      if (isRealtimeMode) {
        const finalParsed = parseAIResponse(currentFullContent);
        if (finalParsed.question) {
          setTimeout(() => {
             speakText(finalParsed.question, () => {
                startListening();
             });
          }, 800);
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-50 flex flex-col p-6 lg:p-10 font-sans">
      <AnimatePresence mode="wait">
        {stage === 'selection' ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto w-full space-y-12"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm tracking-wide uppercase">
                <Sparkles size={16} />
                AI Career Coach
              </div>
              <h1 className="text-5xl font-black text-slate-800 tracking-tight">
                Mock <span className="text-indigo-600">Interview</span> Prep
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">
                Select your target company to start a simulated Java technical interview in English.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {COMPANIES.map((company) => (
                <div key={company.id} className="group relative flex flex-col text-left p-8 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:shadow-2xl overflow-hidden min-h-[400px]">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${company.color} opacity-5 rounded-bl-[100px] transition-all group-hover:opacity-10 group-hover:scale-110`} />
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${company.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                    <Building2 size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{company.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 flex-1 italic">{company.description}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {company.focus.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 text-xs font-bold border border-slate-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => startInterview(company, false)}
                      className="w-full flex items-center justify-between px-6 py-3.5 bg-slate-50 text-slate-700 font-black rounded-2xl hover:bg-slate-100 transition-all group-hover:shadow-sm"
                    >
                      Chat Mode <ChevronRight size={18} />
                    </button>
                    <button 
                      onClick={() => startInterview(company, true)}
                      className="w-full flex items-center justify-between px-6 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                      <span className="flex items-center gap-2"><Phone size={18} /> Live Call</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-4 text-center md:text-left">
                <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-widest text-sm mb-2">
                  <Calendar size={18} />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <h2 className="text-3xl font-black">Daily Challenge</h2>
                <p className="text-slate-400 max-w-md text-lg italic">
                  One question a day keeps the rejection away. Level up your Java and English speaking skills.
                </p>
                <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                   <button 
                    onClick={handleDailyChallenge}
                    className="px-8 py-3.5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-colors shadow-lg active:scale-95"
                   >
                      Start Today's Quiz
                   </button>
                </div>
              </div>
              <div className="relative w-48 h-48 flex items-center justify-center">
                 <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
                 <Trophy size={100} className="relative z-10 text-amber-300 drop-shadow-2xl" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="interview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto w-full relative"
          >
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={resetInterview} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-90">
                  <RotateCcw size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    {isRealtimeMode ? (
                      <span className="flex items-center gap-2 text-rose-500">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                        Voice Call
                      </span>
                    ) : isDailyChallenge ? "Daily Challenge" : "Mock Interview"}
                  </h2>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-bold italic">
                    <Building2 size={14} className="text-indigo-500" />
                    {selectedCompany?.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isRealtimeMode && (
                  <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                     <div className="flex gap-1 items-center">
                        {[1,2,3,4,5].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: isSpeaking || isListening ? [8, 20, 8] : 8 }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className={`w-1 rounded-full ${isSpeaking ? 'bg-rose-500' : isListening ? 'bg-indigo-500' : 'bg-slate-300'}`}
                          />
                        ))}
                     </div>
                  </div>
                )}
                
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden relative">
              {/* Interim Transcript Overlay */}
              <AnimatePresence>
                {isListening && interimTranscript && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-indigo-600/90 backdrop-blur-md text-white rounded-full shadow-2xl flex items-center gap-3 border border-indigo-400/30"
                  >
                    <Mic size={16} className="animate-pulse" />
                    <span className="text-sm font-medium tracking-wide">"{interimTranscript}..."</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth no-scrollbar">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {m.role === 'user' ? <User size={20} /> : <Terminal size={20} />}
                      </div>
                      
                      <div className={`space-y-4 ${m.role === 'user' ? 'text-right' : ''}`}>
                         <div className={`p-6 rounded-[32px] text-sm md:text-base leading-relaxed break-words shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}>
                            {m.role === 'assistant' ? (
                               <div className="space-y-6 text-left">
                                  {m.feedback && (
                                     <div className="pb-4 border-b border-indigo-100/30">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                                           <CheckCircle2 size={12} /> Feedback
                                        </div>
                                        <MarkdownText content={m.feedback} className="text-slate-600 italic text-sm" />
                                     </div>
                                  )}
                                  
                                  <div className="space-y-4">
                                     {m.feedback && <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                                        <MessageSquare size={12} /> Question
                                     </div>}
                                     <MarkdownText content={m.question} className="text-slate-800 font-medium" />
                                  </div>

                                  {(m.recommendation || m.example) && (
                                     <div className="mt-4 pt-4">
                                        <button 
                                           onClick={() => toggleRecommendation(i)}
                                           className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm active:scale-95"
                                        >
                                           <Lightbulb size={14} className={m.showRecommendation ? "fill-amber-400 text-amber-500" : ""} />
                                           {m.showRecommendation ? "Hide Details" : "Show Recommendation & Example"}
                                           {m.showRecommendation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        
                                        <AnimatePresence>
                                           {m.showRecommendation && (
                                              <motion.div 
                                                 initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                 animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                                 exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                 className="overflow-hidden space-y-4"
                                              >
                                                 {m.recommendation && (
                                                   <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900 text-sm italic shadow-sm">
                                                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">
                                                         <Brain size={12} /> Strategy Hint
                                                      </div>
                                                      <MarkdownText content={m.recommendation} />
                                                   </div>
                                                 )}
                                                 
                                                 {m.example && (
                                                   <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 text-sm shadow-sm">
                                                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">
                                                         <Award size={12} /> Example Answer
                                                      </div>
                                                      <MarkdownText content={m.example} className="font-medium" />
                                                   </div>
                                                 )}
                                              </motion.div>
                                           )}
                                        </AnimatePresence>
                                     </div>
                                  )}
                               </div>
                            ) : (
                               <p>{m.content}</p>
                            )}

                            {m.isLoading && (
                               <div className="flex gap-1 items-center mt-2">
                                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                               </div>
                            )}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} className="h-4" />
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={isListening ? "Listening..." : "Type your answer..."}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:italic pr-12 font-medium"
                    />
                    <button 
                      onClick={startListening} 
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                    >
                      <Mic size={20} />
                    </button>
                  </div>
                  <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50">
                    <Send size={24} />
                  </button>
                </div>
                
                <div className="mt-3 flex justify-center gap-4">
                  {isRealtimeMode && (
                    <button onClick={resetInterview} className="flex items-center gap-2 px-6 py-2 bg-rose-50 text-rose-600 font-black rounded-xl hover:bg-rose-100 transition-all active:scale-95 border border-rose-100 text-xs uppercase tracking-tighter">
                      <PhoneOff size={14} /> End Session
                    </button>
                  )}
                  <div className="flex gap-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 italic"><CheckCircle2 size={10} className="text-emerald-500" /> Proficient English</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 italic"><CheckCircle2 size={10} className="text-emerald-500" /> High-Level Java</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Voice Settings Modal */}
            <AnimatePresence>
              {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                   <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSettingsOpen(false)}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                   />
                   <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
                   >
                     <div className="p-8 space-y-8">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                             <Settings size={20} />
                           </div>
                           <h3 className="text-xl font-black text-slate-800">Voice Settings</h3>
                         </div>
                         <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                           <X size={20} />
                         </button>
                       </div>

                       <div className="space-y-6">
                         <div className="space-y-3">
                           <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <User size={14} /> Interviewer Voice
                           </label>
                           <select 
                            value={selectedVoiceName}
                            onChange={(e) => setSelectedVoiceName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer font-medium"
                           >
                             {availableVoices.map(voice => (
                               <option key={voice.name} value={voice.name}>
                                 {voice.name} ({voice.lang})
                               </option>
                             ))}
                           </select>
                           <button 
                            onClick={() => speakText("Hello, I am your senior Java interviewer. How are you doing today?")}
                            className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors px-1"
                           >
                             <Play size={12} fill="currentColor" /> Test this voice
                           </button>
                         </div>

                         <div className="space-y-4 pt-2">
                           <div className="space-y-2">
                             <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                               <span className="flex items-center gap-2"><Sliders size={14} /> Talking Speed</span>
                               <span className="text-indigo-600">{voiceSettings.rate}x</span>
                             </div>
                             <input 
                              type="range" min="0.5" max="1.5" step="0.1" 
                              value={voiceSettings.rate}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                             />
                           </div>

                           <div className="space-y-2">
                             <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                               <span>Voice Pitch</span>
                               <span className="text-indigo-600">{voiceSettings.pitch}x</span>
                             </div>
                             <input 
                              type="range" min="0.5" max="1.5" step="0.1" 
                              value={voiceSettings.pitch}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                             />
                           </div>
                         </div>
                       </div>
                       
                       <button 
                        onClick={() => setIsSettingsOpen(false)}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                       >
                         Save Changes
                       </button>
                     </div>
                   </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewPrep;
