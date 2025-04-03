"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, Trash2, Plus, Sparkles, HeartPulse, Brain, BookOpen, 
  Home, MessageCircle, Activity, LayoutDashboard, Link as LinkIcon, Mic,
  Volume2, VolumeX, Globe 
} from 'lucide-react';
import Link from 'next/link';
import '../app/globals.css';
import router from 'next/router';
import { getUserData, updateUserData } from '@/utils/userStorage';

// Custom Card Components with proper TypeScript types
const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <div 
    className={`rounded-lg border bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-lg transition-shadow duration-300 ${className}`} 
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <div 
    className={`flex flex-col space-y-1.5 p-6 ${className}`} 
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <h3 
    className={`text-2xl font-semibold leading-none tracking-tight text-white ${className}`} 
    {...props}
  >
    {children}
  </h3>
);

const CardContent = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <div 
    className={`p-6 pt-0 ${className}`} 
    {...props}
  >
    {children}
  </div>
);

const CardDescription = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <p 
    className={`text-sm text-gray-400 ${className}`} 
    {...props}
  >
    {children}
  </p>
);

// Custom Navbar
const Navbar = ({ language, toggleLanguage }: { language: string, toggleLanguage: () => void }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
          Mind & Soul
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/chatbot" 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chatbot
          </Link>
          
          <Link 
            href="/suggestions" 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <Activity className="w-5 h-5" />
            Suggestions
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
            title={`Switch to ${language === 'en' ? 'Tamil' : 'English'}`}
          >
            <Globe className="w-5 h-5" />
            <span>{language === 'en' ? 'EN' : 'TA'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

// Quick Start Cards Data with enhanced descriptions
const QuickStartCards = [
  {
    icon: <HeartPulse className="w-10 h-10 text-pink-400" />,
    title: {
      en: "Emotional Support",
      ta: "உணர்வு ஆதரவு"
    },
    description: {
      en: "Get compassionate guidance for your emotional well-being. Our AI assistant is trained to provide empathetic responses and help you navigate difficult emotions.",
      ta: "உங்கள் உணர்வு நலனுக்கு அன்புடன் வழிகாட்டுதல் பெறுங்கள். எங்கள் AI உதவியாளர் அனுதாபமான பதில்களை வழங்கவும், கடினமான உணர்வுகளை வழிநடத்தவும் பயிற்சி பெற்றுள்ளார்."
    },
    color: "from-pink-500 to-rose-500",
    prompt: {
      en: "I'm feeling emotionally overwhelmed and could use some support...",
      ta: "நான் உணர்ச்சி ரீதியாக பாதிக்கப்பட்டிருக்கிறேன், சில ஆதரவு தேவைப்படுகிறது..."
    }
  },
  {
    icon: <Brain className="w-10 h-10 text-indigo-400" />,
    title: {
      en: "Mental Health Tips",
      ta: "மன நல குறிப்புகள்"
    },
    description: {
      en: "Explore evidence-based strategies for stress management, anxiety reduction, and overall mental wellness. Learn practical self-care techniques.",
      ta: "மன அழுத்த மேலாண்மை, கவலை குறைப்பு மற்றும் ஒட்டுமொத்த மன நலனுக்கான ஆதாரப்பூர்வமான உத்திகளை ஆராயுங்கள். நடைமுறை சுய-பராமரிப்பு நுட்பங்களைக் கற்றுக்கொள்ளுங்கள்."
    },
    color: "from-indigo-500 to-purple-500",
    prompt: {
      en: "What are some effective ways to manage daily stress?",
      ta: "அன்றாட மன அழுத்தத்தை சமாளிக்க சில சிறந்த வழிகள் என்ன?"
    }
  },
  {
    icon: <BookOpen className="w-10 h-10 text-emerald-400" />,
    title: {
      en: "Personal Growth",
      ta: "தனிப்பட்ட வளர்ச்சி"
    },
    description: {
      en: "Discover insights for personal development, building resilience, and improving relationships. Tools for self-reflection and positive change.",
      ta: "தனிப்பட்ட வளர்ச்சி, மீள்திறன் கட்டமைத்தல் மற்றும் உறவுகளை மேம்படுத்துவதற்கான நுண்ணறிவுகளைக் கண்டறியுங்கள். சுய-பிரதிபலிப்பு மற்றும் நேர்மறையான மாற்றத்திற்கான கருவிகள்."
    },
    color: "from-emerald-500 to-teal-500",
    prompt: {
      en: "How can I develop better habits and break negative patterns?",
      ta: "நான் சிறந்த பழக்கங்களை உருவாக்கவும், எதிர்மறையான முறைகளை உடைக்கவும் எப்படி?"
    }
  }
];

// Message Interface
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
}

// Updated Button Styles
const buttonStyles = "p-3 rounded-lg border border-gray-700 text-gray-100 transition-colors duration-300 hover:bg-gray-700";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      const data = getUserData(currentUser.username);
      if (data) {
        setUserData(data);
        setChatHistory(data.chatHistory || []);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Update speech recognition language when language changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = language === 'en' ? 'en-US' : 'ta-IN';
    }
  }, [language, recognition]);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = language === 'en' ? 'en-US' : 'ta-IN';

      recog.onstart = () => {
        finalTranscript.current = '';
        setInput('');
        setIsListening(true);
      };

      recog.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript.current += transcript + ' ';
            setInput(finalTranscript.current.trim());
          } else {
            interim += transcript;
          }
        }
        setInput(finalTranscript.current + interim);
      };

      recog.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        isListeningRef.current = false;
      };

      recog.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
      };

      setRecognition(recog);
    }
  }, [language]);

  // Speech synthesis setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = (text: string, messageId: string) => {
    if (!synthesisRef.current) return;
    
    // Stop any ongoing speech
    synthesisRef.current.cancel();
    setSpeakingMessageId(null);

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language and voice based on selected language
    utterance.lang = language === 'en' ? 'en-US' : 'ta-IN';
    
    // Attempt to find a matching voice for the selected language
    const voices = synthesisRef.current.getVoices();
    const languageCode = language === 'en' ? 'en' : 'ta';
    
    // Find a voice that matches the language code
    const voice = voices.find(v => v.lang.includes(languageCode));
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeakingMessageId(messageId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    synthesisRef.current.speak(utterance);
  };

  // Load available voices when speech synthesis is ready
  useEffect(() => {
    const loadVoices = () => {
      if (synthesisRef.current) {
        // Just getting the voices forces them to load
        synthesisRef.current.getVoices();
      }
    };

    // Chrome requires this workaround to load voices properly
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      isListeningRef.current = false;
    } else {
      finalTranscript.current = '';
      recognition?.start();
      isListeningRef.current = true;
    }
    setIsListening(!isListening);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Stop any ongoing speech recognition
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      isListeningRef.current = false;
    }

    // Stop any ongoing speech synthesis
    synthesisRef.current?.cancel();
    setSpeakingMessageId(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Modify the input if the language is Tamil to include a Tamil generation instruction
      const processedInput = language === 'ta' 
        ? `Generate in Tamil: ${input} in Tamil` // Append "in Tamil" for Tamil responses
        : input;

      const response = await fetch('/api/therapy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: processedInput,
          history: updatedMessages.map(m => ({
            role: m.type,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from AI.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const botMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: '',
        timestamp: Date.now()
      };

      const messagesWithBot = [...updatedMessages, botMessage];
      setMessages(messagesWithBot);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.text) {
              botMessage.content += data.text;
              setMessages(prev => [...prev.slice(0, -1), { ...botMessage }]);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }

      // After receiving complete bot response
      if (botMessage.content) {
        // Remove automatic speech synthesis
        // speak(botMessage.content, botMessage.id);
      }

      // Update user's chat history
      const updatedHistory = messages.length === 0 
        ? [...chatHistory, messagesWithBot]
        : chatHistory.map(chat => 
            chat[0].id === messages[0].id ? messagesWithBot : chat
          );

      setChatHistory(updatedHistory);
      
      // Update user data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.username) {
        updateUserData(currentUser.username, {
          chatHistory: updatedHistory
        });
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your message right now. Please try again later.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChat = (chat: Message[]) => {
    const chatCopy = chat.map(msg => ({ ...msg }));
    setMessages(chatCopy);
  };

  const deleteChat = (index: number) => {
    const updatedHistory = chatHistory.filter((_, i) => i !== index);
    setChatHistory(updatedHistory);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      updateUserData(currentUser.username, {
        chatHistory: updatedHistory
      });
    }
    
    if (messages.length > 0 && messages[0].id === chatHistory[index][0].id) {
      setMessages([]);
    }
  };

  const startNewChat = () => {
    const newChat: Message[] = [{
      id: crypto.randomUUID(),
      type: 'user',
      content: 'New Chat',
      timestamp: Date.now()
    }];
    
    const updatedHistory = [...chatHistory, newChat];
    setChatHistory(updatedHistory);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      updateUserData(currentUser.username, {
        chatHistory: updatedHistory
      });
    }
    
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-violet-950 overflow-hidden">
      <Navbar language={language} toggleLanguage={toggleLanguage} />
      <div className="max-h-[100vh] flex pt-16">
        {/* History Sidebar */}
        <motion.div 
          className="w-80 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 shadow-2xl flex flex-col"
        >
          <Card className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" /> 
                {language === 'en' ? "Chat History" : "அரட்டை வரலாறு"}
              </h3>
              <button
                onClick={startNewChat}
                className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors group"
                title={language === 'en' ? "Start new chat" : "புதிய அரட்டையைத் தொடங்கவும்"}
              >
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
            <div className="flex-1 min-h-[100dvh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {chatHistory.length === 0 ? (
                <p className="p-4 text-gray-400">
                  {language === 'en' ? "No previous conversations" : "முந்தைய உரையாடல்கள் இல்லை"}
                </p>
              ) : (
                <div className='h-[100dvh] overflow-y-scroll flex flex-col'>
                  <AnimatePresence>
                    {chatHistory.map((session, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="p-4 border-b border-gray-800 hover:bg-gray-800/50 group relative transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => loadChat(session)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-200">
                                {language === 'en' ? `Chat ${index + 1}` : `அரட்டை ${index + 1}`}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(session[0].timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {session[0].content}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(index);
                            }}
                            className="flex-shrink-0 p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group"
                            title={language === 'en' ? "Delete this chat" : "இந்த அரட்டையை நீக்கவும்"}
                          >
                            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Main Chat Area */}
        <motion.div 
          className="flex-1 flex flex-col min-h-0"
        >
          <Card className="flex-1 flex flex-col bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl min-h-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/90 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                <Bot className="w-6 h-6 text-indigo-400" />
                {language === 'en' ? "Mind & Soul Assistant" : "மனதும் ஆன்மாவும் உதவியாளர்"}
              </h2>
            </div>

            {/* Quick Start Cards */}
            {messages.length === 0 && (
              <div className='px-6 pt-3'>
              {/* Hero Section with AI Features */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className=" text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  {language === 'en' 
                    ? "Your Compassionate AI Mental Health Companion" 
                    : "உங்கள் அன்பான AI மன நல துணை"}
                </h2>
                <div className="grid grid-cols-3 gap-6 mb-8 px-20 py-10">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-center mb-3">
                      <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {language === 'en' ? "Always Available" : "எப்போதும் கிடைக்கும்"}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {language === 'en' 
                        ? "24/7 support whenever you need someone to talk to, no waiting required" 
                        : "உங்களுக்கு பேச யாராவது தேவைப்படும்போது 24/7 ஆதரவு, காத்திருக்க தேவையில்லை"}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-center mb-3">
                      <HeartPulse className="w-8 h-8 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {language === 'en' ? "Judgment-Free Zone" : "தீர்ப்பு இல்லாத பகுதி"}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {language === 'en' 
                        ? "A safe space to express yourself without fear of judgment or stigma" 
                        : "தீர்ப்பு அல்லது களங்கம் பயமின்றி உங்களை வெளிப்படுத்த ஒரு பாதுகாப்பான இடம்"}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-center mb-3">
                      <Brain className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {language === 'en' ? "Evidence-Based" : "ஆதாரப்பூர்வமான"}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {language === 'en' 
                        ? "Using proven therapeutic techniques to provide meaningful support" 
                        : "அர்த்தமுள்ள ஆதரவை வழங்க நிரூபிக்கப்பட்ட சிகிச்சை நுட்பங்களைப் பயன்படுத்துகிறது"}
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4">
                  {language === 'en'
                    ? "Where would you like to start today?"
                    : "இன்று எங்கிருந்து தொடங்க விரும்புகிறீர்கள்?"}
                </h3>
                <button className='bg-gradient-to-r h-10  rounded-lg from-indigo-600 via-purple-600 to-violet-600 text-white border-0 shadow-lg px-6 transform hover:scale-105 transition-transform btn-xs' onClick={() =>router.push("/suggestions")}>
                  {language === 'en' ? "Find Suggestions" : "பரிந்துரைகளைக் கண்டறியவும்"}
                </button>
              </motion.div>
          
              {/* Quick Start Cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-4"
              >
              </motion.div>
            </div>
            )}

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 min-h-0"
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: message.type === 'user' ? 50 : -50 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[65%] p-4 rounded-lg transition-all duration-300 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none'
                          : 'bg-gray-800/50 text-gray-100 border border-gray-700'
                      }`}
                    >
                      {message.type === 'bot' && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                          <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-indigo-400" />
                            <span className="text-sm font-medium text-gray-200">
                              {language === 'en' ? "Assistant" : "உதவியாளர்"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (speakingMessageId === message.id) {
                                synthesisRef.current?.cancel();
                                setSpeakingMessageId(null);
                              } else {
                                speak(message.content, message.id);
                              }
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              speakingMessageId === message.id
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            title={speakingMessageId === message.id 
                              ? (language === 'en' ? "Stop reading" : "படிப்பதை நிறுத்து") 
                              : (language === 'en' ? "Read message" : "செய்தியைப் படி")}
                          >
                            {speakingMessageId === message.id ? (
                              <VolumeX className="w-4 h-4 text-white" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-white" />
                            )}
                          </button>
                        </div>
                      )}
                      <div className="mb-1 whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs ${message.type === 'user' ? 'text-white/70' : 'text-gray-400'} text-right`}>
                        {new Date(message.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800/50 text-gray-100 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                      <Bot className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-medium text-gray-200">
                        {language === 'en' ? "Assistant" : "உதவியாளர்"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/90">
              <form onSubmit={handleSubmit}>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSubmit(e)}
                    placeholder="Type your message..."
                    className="flex-1 p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`p-3 rounded-lg border border-gray-700 text-gray-100 transition-colors ${isListening ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                    title={isListening ? "Stop voice input" : "Start voice input"}
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                  <button
                    type="submit"
                    className="btn bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 hover:from-indigo-600 hover:via-purple-600 hover:to-violet-600 text-white border-0 shadow-lg px-6 transform hover:scale-105 transition-transform"
                    title="Send message"
                    aria-label="Send message"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </motion.div>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}